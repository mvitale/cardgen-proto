var resUtils = require('_/routes/util/res-utils')
  , card = require('_/models/card')
  , deck = require('_/models/deck')
  , MongooseWrapper = require('_/api-wrappers/mongoose-wrapper')
  , CardSummaryWrapper = require('_/api-wrappers/card-summary-wrapper')
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
  var newCard = card.new(cardData);

  newCard.populateDefaultsAndChoices((err) => {
    if (err) return resUtils.errJsonRes(res, err);

    newCard.save((err, newCard) => {
      if (err) return resUtils.errJsonRes(res, err);
      resUtils.jsonRes(res, resUtils.httpStatus.created, new MongooseWrapper(newCard));
    });
  });
}

function createCard(req, res) {
  var cardData = Object.assign({ userId: req.params.userId }, req.body);
  commonCreateCard(res, cardData);
}
module.exports.createCard = createCard;

function createCardInDeck(req, res) {
  var deckId = req.params.deckId
    , userId = req.params.userId
    ;

  deck.Deck.findOne({
    userId: userId,
    _id: deckId
  }, (err, deck) => {
    if (err) return resUtils.errJsonRes(res, err);

    if (!deck) {
      return resUtils.jsonRes(res, resUtils.httpStatus.notFound,
        { msg: 'Deck ' + deckId + ' belonging to user ' + userId + ' not found' });
    }

    var cardData = Object.assign({
      userId: req.params.userId,
      _deck: deck
    }, req.body);

    commonCreateCard(res, cardData);
  });
}
module.exports.createCardInDeck = createCardInDeck;

function putCardData(req, res) {
  var cardId = req.params.cardId
    , userId = req.params.userId
    ;

  card.Card.findOne({ userId: req.params.userId, _id: req.params.cardId }, (err, card) => {
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

    card.data = req.body;
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
module.exports.putCardData = putCardData;

function assignDeckIdHelper(req, res, deckId) {
  var cardId = req.params.cardId
    , userId = req.params.userId
    ;

  card.Card.findOne({ userId: userId, _id: cardId }, (err, card) => {
    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    if (!card) {
      return cardNotFound(res, cardId, userId);
    }

    if (deckId) {
      deck.Deck.findOne({ userId: req.params.userId, _id: deckId }, (err, deck) => {
        if (err) {
          return resUtils.errJsonRes(res, err);
        }

        if (!deck) {
          return deckNotFound(res, deckId, userId);
        }

        card._deck = deck;
        saveAndSendCard(res, card);
      });
    } else {
      card._deck = null;
      saveAndSendCard(res, card);
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

function assignCardDeck(req, res) {
  assignDeckIdHelper(req, res, req.body);
}
module.exports.assignCardDeck = assignCardDeck;

function removeCardDeck(req, res) {
  assignDeckIdHelper(req, res, null);
}
module.exports.removeCardDeck = removeCardDeck;

function cardIdsForUser(req, res) {
  card.Card.find({ userId: req.params.userId}).sort('-_id').exec((err, results) => {
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
  card.Card.find({ userId: req.params.userId})
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

  deck.Deck.findOne({
    userId: userId,
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

  card.Card.findOne({ userId: userId, _id: cardId }, (err, card) => {
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

  card.Card.findOneAndRemove({ userId: userId, _id: cardId }, (err, card) => {
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
