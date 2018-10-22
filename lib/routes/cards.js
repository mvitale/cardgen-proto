var reqlib = require('app-root-path').require
  , resUtils = reqlib('lib/routes/util/res-utils')
  , Card = reqlib('lib/models/card')
  , Deck = reqlib('lib/models/deck')
  , DeckPdfResult = reqlib('lib/models/deck-pdf-result')
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper')
  , DeckWrapper = reqlib('lib/api-wrappers/deck-wrapper')
  , CardSummaryWrapper = reqlib('lib/api-wrappers/card-summary-wrapper')
  , cardSvgCache = reqlib('lib/card-svg-loading-cache')
  , collectionCardCreator = reqlib('lib/collection-card-creator')
  , generator = reqlib('lib/generator')
  , deckPdfMaker = reqlib('lib/deck-pdf-maker')
  , resourceHelpers = reqlib('lib/models/resource-helpers')
  , PngBatchJob = reqlib('lib/png-batch-job').PngBatchJob
  , cardBackStore = reqlib('lib/card-back-store')
  , mongoose = require('mongoose')
  , svg2png = require('svg2png')
  , uuid = require('uuid')
  , VError = require('verror')
  ;

function notFoundHelper(res, type, id, userId) {
  var msgParts = [type, id];

  if (userId) {
    msgParts.push('belonging to user');
    msgParts.push(userId);
  }

  msgParts.push('not found');

  return resUtils.jsonRes(res, resUtils.httpStatus.notFound, {
    msg: msgParts.join(' ')
  });
}

function cardNotFound(res, cardId, userId) {
  return notFoundHelper(res, 'Card', cardId, userId)
}

function deckNotFound(res, deckId, userId) {
  return notFoundHelper(res, 'Deck', deckId, userId);
}

function commonCreateCard(res, cardData, next) {
  var newCard = Card.new(cardData);

  return newCard.populateDefaultsAndChoices(res.log)
    .then(() => {
      return newCard.save(() => {
        resUtils.jsonRes(res, resUtils.httpStatus.created, new MongooseWrapper(newCard));
      });
    })
    .catch(next);
}

function createCard(req, res, next) {
  if (req.body.copyFrom) {
    return copyCard(req, res, next);
  } else {
    if (req.params.deckId) {
      return createCardInDeck(req, res, next);
    } else {
      var cardData = Object.assign({
        userId: req.params.userId,
        appId: req.appId,
        locale: req.locale
      }, req.body);

      return commonCreateCard(res, cardData, next);
    }
  }
}
module.exports.createCard = createCard;

function copyCard(req, res, next) {
  var appId = req.appId
    , userId = req.params.userId
    , cardId = req.body.copyFrom
    , deckId = req.params.deckId
    , resourcePromises = [ resourceHelpers.cardForUserOrPublic(appId, userId, cardId) ]
    ;

  if (deckId) {
    resourcePromises.push(resourceHelpers.deckForUser(appId, userId, deckId))
  }

  return Promise.all(resourcePromises)
    .then((resources) => {
      var card = resources[0]
        , deck = resources.length === 2 ? resources[1] : null
        ;

      if (deckId && !deck) {
        return deckNotFound(res, deckId, userId);
      }

      if (!card) {
        return cardNotFound(res, cardId, userId);
      }

      return Card.copy(card, userId, deck, false).save().then(() => {
        resUtils.jsonRes(res, resUtils.httpStatus.ok, { status: "ok" });
      });
    })
    .catch(next);
}

function createCardInDeck(req, res, next) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    , appId  = req.appId
    ;

  return resourceHelpers.deckForUser(appId, userId, deckId)
    .then((deck) => {
      if (!deck) {
        return resUtils.jsonRes(res, resUtils.httpStatus.notFound, { 
          msg: 'Deck ' + deckId + ' belonging to user ' + userId + ' not found' 
        });
      }

      var cardData = Object.assign({
        userId: userId,
        appId: appId,
        locale: deck.locale || req.locale,
        _deck: deck
      }, req.body);

      return commonCreateCard(res, cardData, next);
    })
    .catch(next);
}
module.exports.createCardInDeck = createCardInDeck;

function save(req, res, next) {
  var cardId = req.params.cardId
    , userId = req.params.userId
    , appId  = req.appId
    ;

  return resourceHelpers.cardForUser(appId, userId, cardId)
    .then((card) => {
      if (!card) {
        resUtils.jsonRes(
          res,
          resUtils.httpStatus.notFound,
          { msg: 'Card ' + cardId + ' belonging to user ' + userId + ' not found'}
        );
        return null;
      }

      if (req.body.data) {
        card.data = req.body.data;
      }

      if (req.body.userData) {
        card.userData = req.body.userData;
      }

      card.version += 1;

      return card;
    })
    .then((card) => {
      if (card) {
        return card.save()
          .then(() => {
            resUtils.jsonRes(res, resUtils.httpStatus.ok,
              new MongooseWrapper(card));
          });
      }
    })
    .catch(next);
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
  saveAndSend(res, card);
}

function saveAndSend(res, model) {
  model.save((err) => {
    if (err) {
      resUtils.errJsonRes(res, err);
    } else {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, new MongooseWrapper(model));
    }
  });
}

/* TODO: rename if this works.. */
function saveAndSendCardSummary(res, card) {
  card.save((err) => {
    if (err) {
      resUtils.errJsonRes(res, err);
    } else {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, { msg: 'ok' });
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

/*
function cardIdsForUser(req, res) {
  resourceHelpers.allCardIdsForUser(req.appId, req.params.userId)
    .then((ids) => {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, ids);
    })
    .catch((err) => {
      resUtils.errJsonRes(res, err);
    });
}
module.exports.cardIdsForUser = cardIdsForUser;
*/

function cardSummariesForUser(req, res, next) {
  return resourceHelpers.allCardsForUser(req.appId, req.params.userId, req.log)
    .then((cards) => {
      return cardSummaryHelper(req, res, cards);
    })
    .catch(next);
}
module.exports.cardSummariesForUser = cardSummariesForUser;

function cardSummaryHelper(req, res, cards) {
  req.log.debug({}, 'cardSummaryHelper BEGIN');

  var summaryPromises = new Array(cards.length);

  for (var i = 0; i < cards.length; i++) {
    summaryPromises[i] = CardSummaryWrapper.new(cards[i]);
  }

  return Promise.all(summaryPromises)
    .then((summaries) => {
      req.log.debug({}, 'cardSummaryHelper END');
      resUtils.jsonRes(res, resUtils.httpStatus.ok, summaries);
    });
}

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

function getCard(req, res, next) {
  var userId = req.params.userId
    , cardId = req.params.cardId
    ;

  return resourceHelpers.cardForUser(req.appId, userId, cardId)
    .then((card) => {
      if (!card) {
        cardNotFound(res, cardId, userId);
      } else {
        resUtils.jsonRes(res, resUtils.httpStatus.ok, new MongooseWrapper(card));
      }
    })
    .catch(next);
}
module.exports.getCard = getCard;

function deleteCard(req, res, next) {
  var userId = req.params.userId
    , cardId = req.params.cardId
    ;

  return resourceHelpers.cardForUser(req.appId, userId, cardId) 
    .then((card) => {
      if (!card) {
        cardNotFound(res, cardId, userId);
      } else {
        card.remove()
          .then(() => {
            resUtils.jsonRes(res, resUtils.httpStatus.ok, {
              msg: 'Card ' + cardId + ' deleted'
            });
          });
      }
    })
    .catch(next);
}
module.exports.deleteCard = deleteCard;

function createDeck(req, res, next) {
  if (req.body.copyFrom) {
    return copyDeck(req, res)
  } 

  var deckData = Object.assign({
    userId: req.params.userId,
    appId: req.appId,
    locale: req.locale
  }, req.body);

  return Deck.create(deckData)
    .then((deck) => {
      resUtils.jsonRes(res, resUtils.httpStatus.created, new MongooseWrapper(deck));
    })
    .catch((err) => {
      resUtils.handleModelErr(res, err);
    });
}
module.exports.createDeck = createDeck;

function copyDeck(req, res) {
  var appId = req.appId
    , userId = req.params.userId
    , copyFrom = req.body.copyFrom
    , name = req.body.name
    , upgrade = req.body.upgradeTemplates || false
    ;

  return resourceHelpers.deckForUserOrPublic(req.appId, req.params.userId, copyFrom)
    .then((deck) => {
      if (!deck) {
        return deckNotFound(res, copyFrom, userId);
      }

      return Deck.copy(deck, userId, name, upgrade).then((copy) => {
        resUtils.jsonRes(res, resUtils.httpStatus.created, new MongooseWrapper(copy));
      });
    })
    .catch((err) => {
      resUtils.handleModelErr(res, err); 
    });
}

function decksForUser(req, res, next) {
  var userId = req.params.userId
    , appId = req.appId
    ;

  return resourceHelpers.allDecksForUser(appId, userId)
    .then((decks) => {
      var wrappedDeckPromises = decks.map((deck) => {
        return DeckWrapper.newInstance(deck, userId); 
      });
      
      return Promise.all(wrappedDeckPromises);
    })
    .then((wrappedDecks) => {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, wrappedDecks);
    })
    .catch(next);
}
module.exports.decksForUser = decksForUser;

// Only owner may delete deck
function deleteDeck(req, res, next) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    , appId = req.appId
    ;

  return Deck.findOne({
    _id: deckId,
    userId: userId,
    appId: appId
  }).exec().then((deck) => {
    if (!deck) {
      deckNotFound(res, deckId, userId);
    } else {
      deck.remove()
        .then(() => {
          resUtils.jsonRes(res, resUtils.httpStatus.ok,
            { msg: 'Deck ' + deckId + ' deleted' });
        });
    }
  }).catch(next);
}
module.exports.deleteDeck = deleteDeck;

/*
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
*/

function populateDeckFromCollection(req, res, next) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    , colId  = req.body.colId
    , appId  = req.appId
    , theDeck
    ;

  if (!colId) {
    resUtils.jsonRes(res, resUtils.httpStatus.badRequest, {
      msg: 'colId missing from request body'
    });

    return Promise.resolve();  
  }

  return resourceHelpers.deckForUser(appId, userId, deckId)
    .then((deck) => {
      if (!deck) {
        throw new VError({
          name: 'notFound'
        }, 'deck not found');
      } else {
        theDeck = deck;
        return collectionCardCreator.createJob();
      }
    })
    .then((jobId) => {
      collectionCardCreator.runJob(jobId, appId, userId, req.locale, 
        theDeck, colId, req.log);

      return resUtils.jsonRes(res, resUtils.httpStatus.ok, {
        jobId: jobId
      });
    })
    .catch(next);
}
module.exports.populateDeckFromCollection = populateDeckFromCollection;

function collectionJobStatus(req, res, next) {
  var jobId = req.params.jobId
    ;

  return collectionCardCreator.jobStatus(jobId)
    .then((status) => {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, {
        status: status
      });
    })
    .catch(next);
}
module.exports.collectionJobStatus = collectionJobStatus;

function cardSvg(req, res, cacheFn, next) {
  var cardId = req.params.cardId
    , appId  = req.appId
    ;

  return Card.findOne({
    _id: cardId,
    appId: appId
  }).then((card) => {
    if (!card) {
      return cardNotFound(res, cardId);
    }

    return new Promise((resolve, reject) => {
      cardSvgCache[cacheFn].call(cardSvgCache, card, req.log, (err, svg) => {
        if (err) {
          reject(err)
        } else {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.send(svg);
          resolve();
        }
      });
    });
  }).catch(next);
}

module.exports.cardSvgHiRes = function(req, res, next) {
  return cardSvg(req, res, 'getHiRes', next);
}

module.exports.cardSvgLoRes = function(req, res, next) {
  return cardSvg(req, res, 'getLoRes', next);
}

function cardPng(req, res, next) {
  return Card.findOne({
    _id: req.params.cardId,
    appId: req.appId
  }).then((card) => {
    if (!card) {
      return cardNotFound(res, cardId);
    }

    generator.generateSvgHiRes(card, req.log, {}, (err, svg) => {
      if (err) {
        return next(err);
      }

      // TODO: remove magic number
      svg2png(svg, { width: 300 * 2.74 })
        .then((png) => {
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': png.length
          });
          res.end(png);
        }).catch(next);
    });
  }).catch(next);
}
module.exports.cardPng = cardPng;


/*
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
*/

function createDeckPdf(req, res, next) {
  var appId = req.appId
    , deckId = req.body.deckId
    , deckCards
    ;

  return Deck.findOne({
    _id: deckId,
    appId: appId
  })
    .then((deck) => {
      if (!deck) {
        throw new VError({
          name: 'notFound',
          info: {
            deckId: deckId
          }
        }, 'deck not found');
      }

      // TODO: make this call return a Promise
      return new Promise((resolve, reject) => {
        deck.cards((err, cards) => {
          if (err) return reject(err);
          resolve(cards);
        });
      }).then((cards) => {
        if (!cards.length) {
          throw new VError({
            name: 'notFound'
          }, 'no cards found in deck');
        }

        deckCards = cards;
        return deckPdfMaker.createJob();
      });
    }).then((jobId) => {
      deckPdfMaker.runJob(jobId, deckCards, req.body.backId, req.log);
      resUtils.jsonRes(res, resUtils.httpStatus.ok, {
        jobId: jobId
      });
    })
    .catch(next);
}
module.exports.createDeckPdf = createDeckPdf;


function deckPdfStatus(req, res, next) {
  return deckPdfMaker.jobStatus(req.params.id)
    .then((status) => {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, {
        status: status
      });
    })
    .catch(next);
}
module.exports.deckPdfStatus = deckPdfStatus;

function deckPdfResult(req, res, next) {
  DeckPdfResult.getPath(req.params.id)
    .then((path) => {
      if (!path) {
        throw new VError({
          name: 'notFound'
        }, 'deck PDF result not found');
      }

      res.sendFile(path, {}, (err) => {
        if (err) {
          throw err;
        }
      })
    })
    .catch(next);
}
module.exports.deckPdfResult = deckPdfResult;

function setDeckDesc(req, res, next) {
  var appId = req.appId
    , userId = req.params.userId
    , deckId = req.params.deckId
    ;

  return resourceHelpers.deckForUser(appId, userId, deckId)
    .then((deck) => {
      if (!deck) {
        deckNotFound(res, req.params.deckId, userId);
        return null;
      }

      deck.desc = req.body;
      return deck.save();
    })
    .then((deck) => {
      if (deck) {
        resUtils.jsonRes(res, resUtils.httpStatus.ok, { status: "ok" })
      }
    })
    .catch(next);
}
module.exports.setDeckDesc = setDeckDesc;

function makeDeckPublic(req, res, next) {
  return setDeckPublic(req, res, true, next);
}
module.exports.makeDeckPublic = makeDeckPublic;

function makeDeckPrivate(req, res, next) {
  return setDeckPublic(req, res, false, next);
}
module.exports.makeDeckPrivate = makeDeckPrivate;

function setDeckPublic(req, res, public, next) {
  var appId = req.appId
    , userId = req.params.userId
    , deckId = req.params.deckId
    ;

  return resourceHelpers.deckForUser(appId, userId, deckId)
    .then((deck) => {
      if (!deck) {
        deckNotFound(res, deckId, userId);
        return null
      }

      deck.public = public;
      return deck.save();
    })
    .then((deck) => {
      if (deck) {
        resUtils.jsonRes(res, resUtils.httpStatus.ok, { status: 'ok' });
      }
    })
    .catch(next);
}

function getPublicDecks(req, res, next) {
  return getPublicResource(req, res, 'publicDecks', next);
}
module.exports.getPublicDecks = getPublicDecks;

function getPublicCards(req, res, next) {
  return resourceHelpers.publicCards(req.appId)
    .then((cards) => {
      cardSummaryHelper(req, res, cards); 
    })
    .catch(next);
}
module.exports.getPublicCards = getPublicCards;

function getPublicResource(req, res, resourceFnName, next) {
  return resourceHelpers[resourceFnName](req.appId)
    .then((resources) => {
      var wrapped = new Array(resources.length);

      for (var i = 0; i < resources.length; i++) {
        wrapped[i] = new MongooseWrapper(resources[i]);
      }

      resUtils.jsonRes(res, resUtils.httpStatus.ok, wrapped);
    })
    .catch(next);
}

function addUserToDeck(req, res, next) {
  var appId = req.appId
    , deckId = req.params.deckId
    , reqUserId = req.params.userId
    , addUserId = req.body
    ;

  return deckUserHelper(
    res, 
    appId, 
    deckId, 
    reqUserId, 
    addUserId, 
    'addUserToDeck',
    next
  );
}
module.exports.addUserToDeck = addUserToDeck;

function removeDeckUser(req, res, next) {
  var appId = req.appId
    , deckId = req.params.deckId
    , reqUserId = req.params.userId
    , removeUserId = req.params.removeUserId
    ;

  return deckUserHelper(
    res, 
    appId, 
    deckId, 
    reqUserId, 
    removeUserId, 
    'removeDeckUser',
    next
  );
}
module.exports.removeDeckUser = removeDeckUser;

function deckUserHelper(
  res, 
  appId, 
  deckId, 
  reqUserId, 
  updateUserId, 
  resourceFnName, 
  next
) {
  return resourceHelpers[resourceFnName](appId, reqUserId, updateUserId, deckId)
    .then(() => {
      resUtils.jsonRes(res, resUtils.httpStatus.ok, { status: "ok" })
    })
    .catch(next);
}

function deckUsers(req, res, next) {
  var appId = req.appId
    , deckId = req.params.deckId
    , userId = req.params.userId
    ;

  return resourceHelpers.deckForUser(appId, userId, deckId).then((deck) => {
    if (!deck) {
      deckNotFound(res, deckId, userId);
      return null;
    }

    resUtils.jsonRes(res, resUtils.httpStatus.ok, {
      ownerId: deck.userId,
      userIds: deck.userIds
    });
  })
  .catch(next);
}
module.exports.deckUsers = deckUsers;

function renameDeck(req, res, next) {
  var appId = req.appId
    , deckId = req.params.deckId
    , userId = req.params.userId
    ;

  return resourceHelpers.deckForUser(appId, userId, deckId)
    .then((deck) => {
      if (deck) {
        deck.name = req.body;
        return deck.save().then(() => {
          resUtils.jsonRes(res, resUtils.httpStatus.ok, {
            msg: 'deck name successfully changed'
          });
        });
      } else {
        deckNotFound(res, deckId, userId);
      }
    })
    .catch(next);
}
module.exports.renameDeck = renameDeck;

function getCardBacks(req, res, next) {
  try {
    resUtils.jsonRes(res, resUtils.httpStatus.ok, cardBackStore.list(req.locale));
  } catch (e) {
    next(e);
  }
}
module.exports.getCardBacks = getCardBacks;

