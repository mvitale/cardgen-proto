var resUtils = require('_/routes/util/res-utils')
  , Card = require('_/models/card')
  , Deck = require('_/models/deck')
  , MongooseWrapper = require('_/api-wrappers/mongoose-wrapper')
  , CardSummaryWrapper = require('_/api-wrappers/card-summary-wrapper')
  , cardSvgCache = require('_/card-svg-loading-cache')
  , collectionCardCreator = require('_/collection-card-creator')
  , mongoose = require('mongoose')
  , generator = require('_/generator')
  , deckPdfMaker = require('_/deck-pdf-maker')
  , PDFDocument = require('pdfkit')
  ;

function notFoundHelper(res, data) {
  return resUtils.jsonRes(res, resUtils.httpStatus.notFound, data);
}

function cardNotFound(res, cardId, userId) {
  return notFoundHelper(res, {
    msg: 'Card ' + cardId + ' belonging to user ' + userId + ' not found'
  });
}

function deckNotFound(res, deckId, userId) {
  return notFoundHelper(res, {
    msg: 'Deck ' + deckId + ' belonging to user ' + userId + ' not found'
  });
}

function commonCreateCard(res, cardData) {
  var newCard = Card.new(cardData);

  newCard.populateDefaultsAndChoices((err) => {
    if (err) return resUtils.errJsonRes(res, err);

    newCard.save((err, newCard) => {
      if (err) return resUtils.errJsonRes(res, err);
      resUtils.jsonRes(res, resUtils.httpStatus.created, new MongooseWrapper(newCard));
    });
  });
}

function createCard(req, res) {
  var cardData = Object.assign({
    userId: req.params.userId,
    appId: req.appId,
    locale: req.locale
  }, req.body);
  commonCreateCard(res, cardData);
}
module.exports.createCard = createCard;

function createCardInDeck(req, res) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    ;

  Deck.findOne({
    userId: userId,
    appId: req.appId,
    _id: deckId
  }, (err, deck) => {
    if (err) return resUtils.errJsonRes(res, err);

    if (!deck) {
      return resUtils.jsonRes(res, resUtils.httpStatus.notFound,
        { msg: 'Deck ' + deckId + ' belonging to user ' + userId + ' not found' });
    }

    var cardData = Object.assign({
      userId: req.params.userId,
      appId: req.appId,
      locale: req.locale,
      _deck: deck
    }, req.body);

    commonCreateCard(res, cardData);
  });
}
module.exports.createCardInDeck = createCardInDeck;

function save(req, res) {
  var cardId = req.params.cardId
    , userId = req.params.userId
    ;

  Card.findOne({
    userId: req.params.userId,
    appId: req.appId,
    _id: req.params.cardId
  }, (err, card) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    if (!card) {
      return resUtils.jsonRes(
        res,
        resUtils.httpStatus.notFound,
        { msg: 'Card ' + cardId + ' belonging to user ' + userId + ' not found'}
      );
    }

    if (req.body.data) {
      card.data = req.body.data;
    }

    if (req.body.userData) {
      card.userData = req.body.userData;
    }

    card.version += 1;

    card.save((err) => {
      if (err) {
        resUtils.errJsonRes(res, err);
      } else {
        resUtils.jsonRes(res, resUtils.httpStatus.ok,
          new MongooseWrapper(card));
      }
    })
  });
}
module.exports.save = save;

function assignDeckIdHelper(req, res, deckId) {
  var cardId = req.params.cardId
    , userId = req.params.userId
    ;

  Card.findOne({
    userId: userId,
    appId: req.appId,
    _id: cardId
  }, (err, card) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    if (!card) {
      return cardNotFound(res, cardId, userId);
    }

    if (deckId) {
      Deck.findOne({
        userId: req.params.userId,
        appId: req.appId,
        _id: deckId
      }, (err, deck) => {
        if (err) {
          return resUtils.errJsonRes(res, err);
        }

        if (!deck) {
          return deckNotFound(res, deckId, userId);
        }

        card._deck = deck;
        saveAndSendCardSummary(res, card);
      });
    } else {
      card._deck = null;
      saveAndSendCardSummary(res, card);
    }
  });
}

function saveAndSendCard(res, card) {
  card.save((err) => {
    if (err) {
      resUtils.errJsonRes(res, err);
    } else {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, new MongooseWrapper(card));
    }
  });
}

function saveAndSendCardSummary(res, card) {
  card.save((err) => {
    if (err) {
      resUtils.errJsonRes(res, err);
    } else {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, new CardSummaryWrapper(card));
    }
  });
}

function assignCardDeck(req, res) {
  assignDeckIdHelper(req, res, req.body);
}
module.exports.assignCardDeck = assignCardDeck;

function removeCardDeck(req, res) {
  assignDeckIdHelper(req, res, null);
}
module.exports.removeCardDeck = removeCardDeck;

function cardIdsForUser(req, res) {
  Card.find({
    userId: req.params.userId,
    appId: req.appId
  }).sort('-_id').exec((err, results) => {
    var ids = [];

    if (err) {
      resUtils.errJsonRes(res, err);
    } else {
      results.forEach(function(result) {
        ids.push(result._id);
      });

      resUtils.jsonRes(res, resUtils.httpStatus.ok, ids);
    }
  });
}
module.exports.cardIdsForUser = cardIdsForUser;

function cardSummariesForUser(req, res) {
  Card.find({
    userId: req.params.userId,
    appId: req.appId
  })
    .sort('-_id')
    .populate('_deck')
    .exec((err, results) => {
      var summaries = [];

      if (err) {
        resUtils.errJsonRes(res, err);
      } else {
        results.forEach(function(card) {
          summaries.push(new CardSummaryWrapper(card));
        });

        resUtils.jsonRes(res, resUtils.httpStatus.ok, summaries);
      }
    });
}
module.exports.cardSummariesForUser = cardSummariesForUser;

function cardIdsForDeck(req, res) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    ;

  Deck.findOne({
    userId: userId,
    appId: req.appId,
    _id: deckId
  }, (err, deck) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    if (!deck) {
      return deckNotFound(res, deckId, userId);
    }

    deck.cards((err, cards) => {
      if (err) return resUtils.errJsonRes(res, err);

      var ids = [];

      cards.forEach((card) => {
        ids.push(card._id);
      });

      resUtils.jsonRes(res, resUtils.httpStatus.ok, ids);
    });
  });
}
module.exports.cardIdsForDeck = cardIdsForDeck;

function getCard(req, res) {
  var userId = req.params.userId
    , cardId = req.params.cardId
    ;

  Card.findOne({
    userId: userId,
    appId: req.appId,
    _id: cardId
  })
  .populate('_deck')
  .exec((err, card) => {
    if (err) {
      resUtils.errJsonRes(res, err);
    } else if (!card) {
      cardNotFound(res, cardId, userId);
    } else {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, new MongooseWrapper(card));
    }
  });
}
module.exports.getCard = getCard;

function deleteCard(req, res) {
  var userId = req.params.userId
    , cardId = req.params.cardId
    ;

  Card.findOneAndRemove({
    userId: userId,
    appId: req.appId,
    _id: cardId
  }, (err, card) => {
    if (err) {
      resUtils.errJsonRes(res, err);
    } else if (!card) {
      cardNotFound(res, cardId, userId);
    } else {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, {
        msg: 'Card ' + cardId + ' belonging to user ' + userId + ' deleted'
      });
    }
  });
}
module.exports.deleteCard = deleteCard;

function createDeck(req, res) {
  var deckData = Object.assign({
    userId: req.params.userId,
    appId: req.appId
  }, req.body);

  Deck.create(deckData, (err, deck) => {
    if (err) return resUtils.handleModelErr(res, err);

    resUtils.jsonRes(res, resUtils.httpStatus.created, new MongooseWrapper(deck));
  });
}
module.exports.createDeck = createDeck;

function decksForUser(req, res) {
  Deck.find({
    userId: req.params.userId,
    appId: req.appId
  }).sort('-_id').exec((err, decks) => {
    if (err) return resUtils.errJsonRes(res, err);

    var wrappedDecks = [];

    decks.forEach((deck) => {
      wrappedDecks.push(new MongooseWrapper(deck));
    });

    resUtils.jsonRes(res, resUtils.httpStatus.ok, wrappedDecks);
  });
}
module.exports.decksForUser = decksForUser;

function deleteDeck(req, res) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    ;

  Deck.findOneAndRemove({
    userId: req.params.userId,
    appId: req.appId,
    _id: req.params.deckId
  }, (err, deck) => {
      if (err) {
        resUtils.errJsonRes(res, err);
      } else if (!deck) {
        deckNotFound(res, deckId, userId);
      } else {
        Card.remove({ _deck: deckId }, (err) => {
          if (err) {
            return resUtils.errJsonRes(res, err);
          }

          resUtils.jsonRes(res, resUtils.httpStatus.ok,
            { msg: 'Deck ' + deckId + ' belonging to user ' + userId + ' deleted' });
        });
      }
    }
  );
}
module.exports.deleteDeck = deleteDeck;

function getDeck(req, res) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    ;

  Deck.findOne({
    userId: userId,
    appId: req.appId,
    _id: deckId
  }, (err, deck) => {
    if (err) {
      resUtils.errJsonRes(res, err);
    } else if (!deck) {
      deckNotFound(res, deckId, userId);
    } else {
      resUtils.jsonRes(res, resUtils.httpStatus.ok,
        new MongooseWrapper(deck));
    }
  });
}
module.exports.getDeck = getDeck;

function populateDeckFromCollection(req, res) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    , colId  = req.body.colId
    , appId  = req.appId
    ;

  if (!colId) {
    return resUtils.jsonRes(res, resUtils.httpStatus.badRequest, {
      msg: 'colId missing from request body'
    });
  }

  Deck.findOne({
    userId: userId,
    appId: appId,
    _id: deckId
  }).exec().then(function(deck) {
    if (!deck) {
      deckNotFount(res, deckId, userId);
    }

    collectionCardCreator.createJob(appId, userId, req.locale, deck, colId, req.log)
      .then(function(jobId) {
        resUtils.jsonRes(res, resUtils.httpStatus.ok, {
          jobId: jobId
        });
      }).catch(function(err) {
        resUtils.errJsonRes(res, err);
      });
  }).catch(function(err) {
    resUtils.errJsonRes(res, err);
  });
}
module.exports.populateDeckFromCollection = populateDeckFromCollection;

function collectionJobStatus(req, res) {
  var jobId = req.params.jobId
    , status = collectionCardCreator.jobStatus(jobId)
    ;

  resUtils.jsonRes(res, resUtils.httpStatus.ok, {
    status: status
  });
}
module.exports.collectionJobStatus = collectionJobStatus;

function cardSvg(req, res) {
  var cardId = req.params.cardId
    , userId = req.params.userId
    , appId  = req.appId
    ;

  Card.findOne({
    userId: userId,
    appId, appId,
    _id: cardId
  }, (err, card) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    if (!card) {
      return cardNotFound(res, cardId, userId);
    }

    cardSvgCache.get(card, req.log, (err, svg) => {
      if (err) {
        return resUtils.errJsonRes(res, err);
      } else {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
      }
    });
  });
}
module.exports.cardSvg = cardSvg;

function cardPng(req, res) {
  Card.findById(req.params.cardId, (err, card) => {
    if (err) {
      return errJsonRes(res, err);
    } else {
      generator.generatePng(card, parseInt(req.params.width), req.log, (err, png) => {
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
}
module.exports.cardPng = cardPng;

function copyCard(req, res) {
  Card.findOne({
    userId: req.params.userId,
    appId: req.appId,
    _id: req.params.cardId
  }, (err, card) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    if (!card) {
      return cardNotFound(res, req.params.cardId, req.params.userId);
    }

    card._id = mongoose.Types.ObjectId();
    card.isNew = true;
    card.version = 0;

    if (req.body.deckId) {
      Deck.findOne({
        userId: req.params.userId,
        appId: req.appId,
        _id: req.body.deckId
      }, (err, deck) => {
        if (err) {
          return resUtils.errJsonRes(res, err);
        }

        if (!deck) {
          return deckNotFound(res, req.body.deckId, req.params.userId);
        }

        card._deck = deck;
        saveWithOkRes(card, res);
      });
    } else {
      card._deck = null;
      saveWithOkRes(card, res);
    }
  });
}
module.exports.copyCard = copyCard;

function userCardsWithTaxonId(req, res) {
  Card.find({
    templateParams: {
      speciesId: req.params.taxonId
    },
    userId: req.params.userId,
    appId: req.appId
  }, (err, cards) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    resUtils.jsonRes(res, resUtils.httpStatus.ok, cards.map((card) => {
      return card._id
    }));
  });
}
module.exports.userCardsWithTaxonId = userCardsWithTaxonId;

function createDeckPdf(req, res) {
  Deck.findOne({
    _id: req.body.deckId,
    userId: req.params.userId,
    appId: req.appId
  }, (err, deck) => {
    if (err) {
      return resUtils.errJsonRes(err);
    }

    if (!deck) {
      return deckNotFound(req.params.deckId, req.params.userId);
    }

    deck.cards((err, cards) => {
      var jobId;

      if (!cards.length) {
        return resUtils.jsonRes(res, resUtils.httpStatus.notFound, {
          msg: 'No cards found in deck'
        });
      }

      jobId = deckPdfMaker.startJob(cards, req.log);
      resUtils.jsonRes(res, resUtils.httpStatus.ok, {
        jobId: jobId
      });
    });
  });
}
module.exports.createDeckPdf = createDeckPdf;


function deckPdfStatus(req, res) {
  var status = deckPdfMaker.jobStatus(req.params.id);
  resUtils.jsonRes(res, resUtils.httpStatus.ok, {
    status: status
  });
}
module.exports.deckPdfStatus = deckPdfStatus;

function deckPdfResult(req, res) {
  res.setHeader('Content-Type', 'application/pdf');
  try {
    deckPdfMaker.pipePdf(req.params.id, res, PDFDocument);
  } catch(e) {
    res.log.error({ err: e}, 'Failed to generate PDF for job ' + req.params.id);
    resUtils.jsonRes(res, resUtils.httpStatus.notFound, {
      msg: 'Results of job ' + req.params.id + ' not found'
    });
  }
}
module.exports.deckPdfResult = deckPdfResult;

function saveWithOkRes(card, res) {
  card.save((err, card) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    resUtils.jsonRes(res, resUtils.httpStatus.ok, { status: 'ok' });
  });
}
