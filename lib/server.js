/*
 * Server for the Cards service
 */
var reqlib             = require('app-root-path').require;
var express            = require('express');
var bodyParser         = require('body-parser');
var mongo              = require('mongodb');
var onFinished         = require('on-finished');
var bunyan             = require('bunyan');
var nocache            = require('nocache');
var uuidV1             = require('uuid/v1');
var bugsnag            = require('bugsnag');
var VError             = require('verror');

var dbconnect          = reqlib('lib/dbconnect');
var templateManager    = reqlib('lib/template-manager');
var generator          = reqlib('lib/generator');
var urlHelper          = reqlib('lib/url-helper');
var auth               = reqlib('lib/auth');

var templateRoutes     = reqlib('lib/routes/templates');
var cardRoutes         = reqlib('lib/routes/cards');
var imageRoutes        = reqlib('lib/routes/images');
var dataRoutes         = reqlib('lib/routes/data');
var resUtils           = reqlib('lib/routes/util/res-utils');

var card               = reqlib('lib/models/card');
var Deck               = reqlib('lib/models/deck');
var DedupFile          = reqlib('lib/models/dedup-file');

var config             = reqlib('lib/config/config');

var mongooseWrapper    = reqlib('lib/api-wrappers/mongoose-wrapper');
var TemplateWrapper    = reqlib('lib/api-wrappers/template-wrapper');
var CardSummaryWrapper = reqlib('lib/api-wrappers/card-summary-wrapper');

var app = express();

var sensitiveHeaders = ['x-api-key']
  , notStaticResourcePattern = /^(?!\/static|\/images).+/
  , logLevel = config.get('log.level') || 'info'
  , defaultLocale = config.get('i18n.defaultLocale')
  , availableLocales = config.get('i18n.availableLocales')
  ;

console.log('Log level:', logLevel);

if (config.get('bugsnag.enable')) {
  var apiKey = config.get('bugsnag.apiKey');

  if (!apiKey) {
    throw new TypeError('bugsnag enabled but apiKey not set');
  }

  bugsnag.register(apiKey);
  app.use(bugsnag.requestHandler);
  app.use(bugsnag.errorHandler);

  console.log('bugsnag enabled');
}

/*
 * Copied from bunyan standard serializers, but filters
 * sensitive headers.
 */
function reqSerializer(req) {
  var headers;

  if (!req || !req.connection) {
    return req;
  }

  headers = req.headers ?
    JSON.parse(JSON.stringify(req.headers)) :
    {};

  sensitiveHeaders.forEach((header) => {
    if (header in headers) {
      headers[header] = 'FILTERED';
    }
  });

  return {
      method: req.method,
      url: req.url,
      headers: headers,
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort,
  };
}

// Disable client caching for all routes except static resources
app.use(notStaticResourcePattern, nocache());

// Wire up JSON request parser
var rawAllParser = bodyParser.raw({
  type: '*/*',
  limit: '5mb'
})
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.text());

// Create logger and hang on request and response objects
app.use((req, res, next) => {
  var log = bunyan.createLogger({
    name: 'cardgen',
    reqId: req.get('x-Request-ID') || uuidV1(),
    level: logLevel,
    serializers: {
      err: bunyan.stdSerializers.err,
      res: bunyan.stdSerializers.res,
      req: reqSerializer
    }
  });
  req.log = log;
  res.log = log;
  next();
});

// Log request/response
app.use((req, res, next) => {
  req.log.info({ req: req }, 'Start request');

  onFinished(res, () => {
    req.log.info({ res: res }, 'End request');
  });

  next();
});

// Authentication - add client app id to req or fail
app.use(notStaticResourcePattern, (req, res, next) => {
  var apiKey = req.get('x-api-key')
    , appId = auth.auth(apiKey)
    , err
    ;

  if (appId) {
    req.appId = appId;
    req.log.info({ appId: appId }, 'Authenticated app');
    next();
  } else {
    err = new Error('Bad or missing API key');
    err.status = 403;
    next(err);
  }
});

// Populate req locale from header or default
app.use((req, res, next) => {
  var locale = req.get('x-locale');

  if (locale && availableLocales.includes(locale)) {
    req.log.debug({locale: locale}, 'Setting locale from header');
    req.locale = locale;
  } else {
    if (!locale) {
      req.log.debug({
        locale: defaultLocale
      }, 'Locale missing from request. Using default');
    } else {
      req.log.debug({
        requetedLocale: locale,
        locale: defaultLocale
      }, 'Locale not supported. Using default');
    }
    req.locale = defaultLocale;
  }

  next();
});

/*
 * Test route
 */
app.get('/ping', function(req, res) {
  res.json({ message: 'I\'m up!' });
});

/*
 * Get template data (fields, etc.) for a given template
 *
 * Parameters:
 *  templateName: A valid Template name (see templates directory)
 *  templateVersion: A valid version for the Template with name templateName
 *
 *
 * Response:
 *  JSON representation of the Template (see api-wrappers/template-wrapper.js)
 */
app.get('/templates/:templateName/:templateVersion(\\d\.\\d)', templateRoutes.getTemplate);

var userRouter = new express.Router();
app.use('/users', userRouter);

/*
 * Create a new Card with a given template and templateParams.
 * Expects JSON of the form:
 *
 * {
 *   "templateName": "<template name>",
 *   "templateParams": {
 *     "<template param 1 key>": <template param 1 val>,
 *     ...
 *     "<template param n key">: <tempalte param 1 val>
 *   }
 * }
 *
 * Responds with JSON representation of the new Card, which includes the
 * Card id. See api-wrappers/card-wrapper.js.
 */
userRouter.post('/:userId/cards', cardRoutes.createCard);

/*
 * Create a new Card in a Deck with a given template and templateParams.
 * Expects JSON of the form:
 *
 * {
 *   "templateName": "<template name>",
 *   "templateParams": {
 *     "<template param 1 key>": <template param 1 val>,
 *     ...
 *     "<template param n key">: <tempalte param 1 val>
 *   }
 * }
 *
 * Responds with JSON representation of the new Card, which includes the
 * Card id. See api-wrappers/card-wrapper.js.
 */
userRouter.post('/:userId/decks/:deckId/cards', cardRoutes.createCard);

/*
 * Create a new Deck for a user
 */
userRouter.post('/:userId/decks', cardRoutes.createDeck);

/*
 * Save card data. Expects JSON request body of the form
 * { data: <data>, userData: <userData> }. Replaces both of those fields on the
 * Card and saves it.
 *
 * Parameters:
 *  cardId: a valid card ID (as returned from /cards POST)
 *
 * Response:
 *  JSON respresentation of the updated Card.
 */
userRouter.put('/:userId/cards/:cardId/save', cardRoutes.save);

/*
 * Assign a Card to a Deck
 */
userRouter.put('/:userId/cards/:cardId/deckId', cardRoutes.assignCardDeck);

/*
 * Remove a Card from Deck if it is in one
 */
userRouter.delete('/:userId/cards/:cardId/deckId', cardRoutes.removeCardDeck);

/*
 * GET ids for all cards belonging to a user
userRouter.get('/:userId/cardIds', cardRoutes.cardIdsForUser);
*/

/*
 * GET card summaries for all cards belonging to a user
 */
userRouter.get('/:userId/cardSummaries', cardRoutes.cardSummariesForUser);

/*
 * GET the ids of all cards in a user's Deck
 */
userRouter.get('/:userId/decks/:deckId/cardIds', cardRoutes.cardIdsForDeck);

/*
 * GET all decks belonging to a user
 */
userRouter.get('/:userId/decks', cardRoutes.decksForUser);

/*
 * GET the JSON representation of a Card
 */
userRouter.get('/:userId/cards/:cardId/json', cardRoutes.getCard);

/*
 * DELETE a card
 */
userRouter.delete('/:userId/cards/:cardId', cardRoutes.deleteCard);

/*
 * DELETE a deck. Doesn't delete the cards in the deck, but does set cards in
 * the deck to have _deck = null
 */
userRouter.delete('/:userId/decks/:deckId', cardRoutes.deleteDeck);

/*
 * GET a deck (as opposed to its contents)
 * Disabled for now since eddev always gets the full list of decks.
userRouter.get('/:userId/decks/:deckId', cardRoutes.getDeck);
 */

/*
 * POST a deck's desc field
 */
userRouter.post('/:userId/decks/:deckId/desc', cardRoutes.setDeckDesc)

/*
 * Image upload endpoint. This call is idempotent: if it is called multiple
 * times with the same <<exact>> image file, it returns the same url each time.
 *
 * Response:
 *  {
 *    "url": "<image url>"
 *  }
 *
 * TODO: document/restrict supported file types
 */
userRouter.post('/:userId/images', rawAllParser, imageRoutes.saveImage);

/*
 * Image retrieval endpoint. This path does NOT include the usual /users/:userId
 * prefix so that absolute URLs to uploaded images can be inserted into Card
 * data and requested by the browser directly. The unique imageId should make
 * it sufficiently difficult to find and request another user's image, and we
 * do store the user ID when images are uploaded for tracking purposes.
 */
app.get('/images/:imageId', imageRoutes.getImage);

/* 
 * EOL taxon search
 */
app.get('/taxonSearch/:q', dataRoutes.taxonSearch);

/*
 * GET an SVG of a given card.
 *
 * Parameters:
 *  cardId: A valid Card id
 *
 * Response:
 *  An SVG representation of the Card
 */
app.get('/cards/:cardId/svg/hi', cardRoutes.cardSvgHiRes);
app.get('/cards/:cardId/svg/lo', cardRoutes.cardSvgLoRes);

/*
 * Add a card for every taxon in a collection to a deck. This kicks off an
 * asynchronous job, the status of which can be gotten using the below route.
 */
userRouter.post('/:userId/decks/:deckId/populateFromCollection', cardRoutes.populateDeckFromCollection);

userRouter.post('/:userId/decks/:deckId/name', cardRoutes.renameDeck);

/*
 * Create a PDF of a the deck whose id is specified in the 'deckId' property
 * of the JSON request
 */
app.post('/deckPdfs', cardRoutes.createDeckPdf);

app.get('/deckPdfs/:id/status', cardRoutes.deckPdfStatus);

app.get('/deckPdfs/:id/result', cardRoutes.deckPdfResult);

/*
 * Make a deck public
 */
userRouter.post('/:userId/decks/:deckId/makePublic', cardRoutes.makeDeckPublic);

/*
 * Make a deck private
 */
userRouter.post('/:userId/decks/:deckId/makePrivate', cardRoutes.makeDeckPrivate);

/*
 * Add a user to a deck
 */
userRouter.post('/:userId/decks/:deckId/users', cardRoutes.addUserToDeck);

/*
 * Remove a user from a deck
 */
userRouter.delete('/:userId/decks/:deckId/users/:removeUserId', cardRoutes.removeDeckUser);

/*
 * Get deck users
 */
userRouter.get('/:userId/decks/:deckId/users', cardRoutes.deckUsers);


/*
 * GET public decks
 */
app.get('/public/decks', cardRoutes.getPublicDecks);


/*
 * GET public cards
 */
app.get('/public/cards', cardRoutes.getPublicCards);

/*
 * GET the status of a job started with cardRoutes.populateDeckFromCollection
 */
app.get('/collectionJob/:jobId/status', cardRoutes.collectionJobStatus);

/*
 * GET an PNG of a given card.
 *
 * Parameters:
 *  cardId: A valid Card id
 *
 * Response:
 *  An PNG representation of the Card
 */
app.get('/cards/:cardId/png', cardRoutes.cardPng);

/*
 * GET the list of available card backs
 */
app.get('/cardBacks', cardRoutes.getCardBacks);

// Files in public directory are accessible at /static
app.use('/static', express.static('public'));

/*
 * Error handler
 */
app.use((err, req, res, next) => {
  // Delegate to default error handler. Only do this if necessary, as it writes
  // to stdout and not pretty bunyan logging
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof VError && err.name) {
    if (err.name === 'notFound') {
      return resUtils.notFoundJsonRes(res, err)
    }
  }

  resUtils.errJsonRes(res, err);
});

module.exports = app;
