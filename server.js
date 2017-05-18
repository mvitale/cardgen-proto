/*
 * Server for the Cards service
 */
var express          = require('express');
var bodyParser       = require('body-parser');
var mongo            = require('mongodb');
var onFinished       = require('on-finished');
var bunyan           = require('bunyan');
var nocache          = require('nocache');
var uuidV1           = require('uuid/v1');

var dbconnect        = require('_/dbconnect');
var templateManager  = require('_/template-manager');
var generator        = require('_/generator');
var urlHelper        = require('_/url-helper');
var cardSvgCache     = require('_/card-svg-loading-cache');

var templateRoutes   = require('_/routes/templates');
var cardRoutes       = require('_/routes/cards');
var imageRoutes      = require('_/routes/images');

var card             = require('_/models/card');
var Deck             = require('_/models/deck');
var DedupFile        = require('_/models/dedup-file');

var mongooseWrapper
  = require('_/api-wrappers/mongoose-wrapper');
var TemplateWrapper    = require('_/api-wrappers/template-wrapper');
var CardSummaryWrapper = require('_/api-wrappers/card-summary-wrapper');


/*
 * Map human-readable names to http statuses
 */
var HTTP_STATUS = {
  'created': 201,
  'internalError': 500,
  'ok': 200,
  'notFound': 404
};

// Get that express instance
var app = express();

// Request Logging
app.use((req, res, next) => {
  var log = bunyan.createLogger({
    name: 'cardgen',
    reqId: uuidV1(),
    serializers: bunyan.stdSerializers
  });
  req.log = log;
  res.log = log;
  next();
});

app.use((req, res, next) => {
  req.log.info({ req: req }, 'Start request');

  onFinished(res, () => {
    req.log.info({ res: res }, 'End request');
  });

  next();
});

// Disable client caching
app.use(nocache());

// Wire up JSON request parser
var rawAllParser = bodyParser.raw({
  type: '*/*',
  limit: '5mb'
})
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.text());

// TODO: Set appropriate http status
function okJsonRes(res, data) {
  var resObj = {
    "status": "ok"
  };

  Object.assign(resObj, data);
  res.json(resObj);
}

function errJsonRes(res, err) {
  console.log('error broh: ', err);
  jsonRes(res, 'internalError', {
    'error': JSON.stringify(err)
  });
}

function jsonRes(res, status, data) {
  res.status(HTTP_STATUS[status]).json(data);
}

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
 *
 * Response:
 *  JSON representation of the Template (see api-wrappers/template-wrapper.js)
 */
app.get('/templates/:templateName', templateRoutes.getTemplate);

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
userRouter.post('/:userId/decks/:deckId/cards', cardRoutes.createCardInDeck);

/*
 * Create a new Deck for a user
 */
userRouter.post('/:userId/decks', cardRoutes.createDeck);

/*
 * PUT a given card's data field.
 *
 * Parameters:
 *  cardId: a valid card ID (as returned from /cards POST)
 *
 * Response:
 *  JSON respresentation of the updated Card.
 */
userRouter.put('/:userId/cards/:cardId/data', cardRoutes.putCardData);

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
 */
userRouter.get('/:userId/cardIds', cardRoutes.cardIdsForUser);

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
 * GET an SVG of a given card.
 *
 * Parameters:
 *  cardId: A valid Card id
 *
 * Response:
 *  An SVG representation of the Card
 */
userRouter.get('/:userId/cards/:cardId/svg', cardRoutes.cardSvg);

/*
 * TODO: Currently broken! https://github.com/Automattic/node-canvas/issues/903
 *
 * GET an PNG of a given card.
 *
 * Parameters:
 *  cardId: A valid Card id
 *
 * Response:
 *  An PNG representation of the Card
 */
 /*
userRouter.get('/:userId/cards/:cardId/png/:width', (req, res) => {
 Card.findById(req.params.cardId, (err, card) => {
   if (err) {
     return errJsonRes(res, err);
   } else {
     generator.generatePng(card, parseInt(req.params.width), (err, png) => {
       if (err) {
         return errJsonRes(res, err);
       } else {
         res.writeHead(200, {
           'Content-Type': 'image/png',
           'Content-Length': png.length
         });
         res.end(png);
       }
     });
   }
 });
})
*/

// Files in public directory are accessible at /static
app.use('/static', express.static('public'));

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.log(err);
  res.status(HTTP_STATUS.internalError);
  res.json({ error: err, msg: 'this error handled Expressly for you ;)'});
});

module.exports = app;
