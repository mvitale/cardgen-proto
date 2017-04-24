/*
 * Server/app/controller for the Cards service
 */
var config = require('./config/config');

function logErrorAndDieIfExists(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
}

config.load(function(err) {
  logErrorAndDieIfExists(err);

  var express          = require('express');
  var bodyParser       = require('body-parser');
  var mongo            = require('mongodb');
  var morgan           = require('morgan');
  var nocache          = require('nocache');

  var dbconnect        = require('./dbconnect');
  var templateManager  = require('./template-manager');
  var generator        = require('./generator');
  var urlHelper        = require('./url-helper');

  var Card             = require('./models/card');
  var Deck             = require('./models/deck');
  var DedupFile        = require('./models/dedup-file');

  var MongooseWrapper    = require('./api-wrappers/mongoose-wrapper');
  var TemplateWrapper    = require('./api-wrappers/template-wrapper');
  var CardSummaryWrapper = require('./api-wrappers/card-summary-wrapper');


  var port = config.get('server.port');

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
  app.use(morgan('common'));

  // Disable client caching
  app.use(nocache());

  // Wire up JSON request parser
  app.use(bodyParser.urlencoded({ extended: false }));
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
    console.log(err);
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
  app.get('/templates/:templateName', function(req, res) {
    templateManager.getTemplate(req.params.templateName, (err, template) => {
      if (err) {
        errJsonRes(res, err);
      } else {
        jsonRes(res, 'ok', new TemplateWrapper(template));
      }
    });
  });

  var userRouter = new express.Router();
  app.use('/users', userRouter);

  function commonCreateCard(res, cardData) {
    var card = new Card(cardData);

    card.populateDefaultsAndChoices((err) => {
      if (err) return errJsonRes(res, err);

      card.save((err, card) => {
        if (err) return errJsonRes(res, err);

        jsonRes(res, 'created', new MongooseWrapper(card));
      });
    });
  }

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
  userRouter.post('/:userId/cards', (req, res) => {
    var cardData = Object.assign({ userId: req.params.userId }, req.body);
    commonCreateCard(res, cardData);
  });

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
  userRouter.post('/:userId/decks/:deckId/cards', (req, res) => {
    Deck.findOne({
      userId: req.params.userId,
      _id: req.params.deckId
    }, (err, deck) => {
      if (err) return errJsonRes(res, err);

      if (!deck) {
        return jsonRes(res, 'notFound', { msg: 'Deck not found' });
      }

      var cardData = Object.assign({
        userId: req.params.userId,
        _deck: deck
      }, req.body);

      commonCreateCard(res, cardData);
    });
  });

  /*
   * Create a new Deck for a user
   */
  userRouter.post('/:userId/decks', (req, res) => {
    var deckData = Object.assign({ userId: req.params.userId }, req.body);

    Deck.create(deckData, (err, deck) => {
      if (err) return errJsonRes(res, err);

      jsonRes(res, 'created', new MongooseWrapper(deck));
    });
  });

  /*
   * PUT a given card's data field.
   *
   * Parameters:
   *  cardId: a valid card ID (as returned from /cards POST)
   *
   * Response:
   *  JSON respresentation of the updated Card.
   */
  userRouter.put('/:userId/cards/:cardId/data', (req, res) => {
    Card.findOne({ userId: req.params.userId, _id: req.params.cardId }, (err, card) => {
      if (err) {
        errJsonRes(res, err);
      } else {
        card.data = req.body;

        card.save((err) => {
          if (err) {
            errJsonRes(res, err);
          } else {
            jsonRes(res, 'ok', new MongooseWrapper(card));
          }
        })
      }
    });
  });

  function saveAndSendCard(res, card) {
    card.save((err) => {
      if (err) {
        errJsonRes(res, err);
      } else {
        jsonRes(res, 'ok', new MongooseWrapper(card));
      }
    });
  }

  function assignDeckIdHelper(req, res, deckId) {
    Card.findOne({ userId: req.params.userId, _id: req.params.cardId }, (err, card) => {
      if (err) {
        errJsonRes(res, err);
      } else {
        if (deckId) {
          Deck.findById(deckId, (err, deck) => {
            if (err) {
              errJsonRes(res, err);
            } else {
              card._deck = deck;
              saveAndSendCard(res, card);
            }
          });
        } else {
          card._deck = null;
          saveAndSendCard(res, card);
        }
      }
    });
  }

  /*
   * Assign a Card to a Deck
   */
  userRouter.put('/:userId/cards/:cardId/deckId', (req, res) => {
    assignDeckIdHelper(req, res, req.body);
  });

  /*
   * Remove a Card from Deck if it is in one
   */
  userRouter.delete('/:userId/cards/:cardId/deckId', (req, res) => {
    assignDeckIdHelper(req, res, null);
  });

  function userResourcesHelper(model, req, res) {
    model.find({ userId: req.params.userId}).sort('-_id').exec((err, results) => {
      var ids = [];

      if (err) {
        errJsonRes(res, err);
      } else {
        results.forEach(function(result) {
          ids.push(result._id);
        });

        jsonRes(res, 'ok', ids);
      }
    });
  }

  /*
   * GET ids for all cards belonging to a user
   */
  userRouter.get('/:userId/cardIds', (req, res) => {
    userResourcesHelper(Card, req, res);
  });

  userRouter.get('/:userId/cardSummaries', (req, res) => {
    Card.find({ userId: req.params.userId})
      .sort('-_id')
      .populate('_deck')
      .exec((err, results) => {
        var summaries = [];

        if (err) {
          errJsonRes(res, err);
        } else {
          results.forEach(function(card) {
            summaries.push(new CardSummaryWrapper(card));
          });

          jsonRes(res, 'ok', summaries);
        }
      });
  });

  /*
   * GET the ids of all cards in a user's Deck
   */
  userRouter.get('/:userId/decks/:deckId/cardIds', (req, res) => {
    Deck.findOne({
      userId: req.params.userId,
      _id: req.params.deckId
    }, (err, deck) => {
      if (err) return errJsonRes(res, err);
      if (!deck) return jsonRes(res, 'notFound', { msg: 'Deck not found' });

      deck.cards((err, cards) => {
        if (err) return errJsonRes(res, err);

        var ids = [];

        cards.forEach((card) => {
          ids.push(card._id);
        });

        jsonRes(res, 'ok', ids);
      });
    });
  });

  /*
   * GET the ids of all decks belonging to a user
   */
  userRouter.get('/:userId/decks', (req, res) => {
    Deck.find({ userId: req.params.userId }).sort('-_id').exec((err, decks) => {
      if (err) return errJsonRes(res, err);

      var wrappedDecks = [];

      decks.forEach((deck) => {
        wrappedDecks.push(new MongooseWrapper(deck));
      });

      jsonRes(res, 'ok', wrappedDecks);
    });
  });

  /*
   * GET the JSON representation of a given Card.
   *
   * Parameters:
   *  cardId: A valid Card id
   *
   * Response:
   *  JSON representation of the Card with id cardId
   */
  userRouter.get('/:userId/cards/:cardId', (req, res) => {
    Card.where({ userId: req.params.userId, _id: req.params.cardId }, (err, card) => {
      if (err) {
        errJsonRes(res, err);
      } else {
        jsonRes(res, 'ok', card);
      }
    })
  });

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
  userRouter.post('/:userId/images', bodyParser.raw({type: '*/*'}), (req, res) => {
    DedupFile.findOrCreateFromBuffer(req.body, 'storage/images',
      (err, dedupFile) => {
        if (err) return errJsonRes(err);
        okJsonRes(res, { "url": urlHelper.imageUrl(dedupFile) });;
      }
    );
  });

  userRouter.get('/:userId/images/:imageId', function(req, res) {
    DedupFile.findById(req.params.imageId, (err, file) => {
      if (err) {
       return errJsonRes(res, err);
      }

      file.read((err, buffer) => {
        if (err) return errJsonRes(res, err);

        // TODO: gross
        if (!buffer) return errJsonRes(res, { msg: "not found"});

        res.setHeader('Content-Type', file.mimeType);
        res.end(buffer);
      });
    });
  });


  /*
   * GET an SVG of a given card.
   *
   * Parameters:
   *  cardId: A valid Card id
   *
   * Response:
   *  An SVG representation of the Card
   */
  userRouter.get('/:userId/cards/:cardId/svg', (req, res) => {
    Card.findById(req.params.cardId, (err, card) => {
      if (err) {
        return errJsonRes(res, err);
      } else {
        generator.generateSvg(card, (err, svg) => {
          if (err) {
            return errJsonRes(res, err);
          } else {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(svg);
          }
        });
      }
    });
  });

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
  });

  /*
   * Get the JSON representation of a Card
   */
  userRouter.get('/:userId/cards/:cardId/json', (req, res) => {
    Card.findById(req.params.cardId, (err, card) => {
      if (err) {
        errJsonRes(res, err);
      } else {
        jsonRes(res, 'ok', new MongooseWrapper(card));
      }
    });
  });

  /*
   * DELETE a card
   */
  userRouter.delete('/:userId/cards/:cardId', (req, res) => {
    Card.findByIdAndRemove(req.params.cardId, (err, card) => {
      if (err) {
        errJsonRes(res, err);
      } else {
        jsonRes(res, 'ok', new MongooseWrapper(card));
      }
    });
  });

  /*
   * DELETE a deck. Doesn't delete the cards in the deck, but does set cards in
   * the deck to have _deck = null
   */
  userRouter.delete('/:userId/decks/:deckId', (req, res) => {
    Deck.findOneAndRemove(
      { userId: req.params.userId, _id: req.params.deckId },
      (err, deck) => {
        if (err) return errJsonRes(res, err);
        if (!deck) return jsonRes(res, 'notFound', { msg: 'Deck not found' });

        Card.updateMany({ userId: req.params.userId, _deck: deck._id },
          { _deck: null }, (err) => {
            if (err) return errJsonRes(res, err);
            jsonRes(res, 'ok', { msg: "Deck " + deck._id + " removed" });
          }
        );
      }
    );
  });

  // Files in public directory are accessible at /static
  app.use('/static', express.static('public'));

  /*
   * Open mongoose database connection, then start the server.
   */
  dbconnect.mongooseInit((err) => {
    logErrorAndDieIfExists(err);
    app.listen(port);
    console.log('Server running on port ' + port);
  });
});
