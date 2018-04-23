var reqlib = require('app-root-path').require;
var Card = reqlib('lib/models/card');
var Deck = reqlib('lib/models/deck');

var cardSummaryFields = {
  _deck: 1,
  _id: 1,
  public: 1,
  createdAt: 1,
  updatedAt: 1,
  version: 1,
  commonName: 1,
  sciName: 1,
  locale: 1
};
  '_deck _id public createdAt updatedAt version commonName sciName locale';

function allCardsForUser(appId, userId, log) {
  log.debug({ userId: userId, appId: appId }, 'allCardsForUser START');
  return new Promise((resolve, reject) => {
    allDeckIdsForUser(appId, userId)
      .then((deckIds) => {
        log.debug({deckIds: deckIds}, 'allCardsForUser DECK_IDS_DONE');
        Card.find({
          appId: appId,
          $or: [
            { userId: userId, _deck: null },
            { _deck: { $in: deckIds } }
          ] 
        })
        .sort('_id')
        .populate('_deck')
        .select(cardSummaryFields)
        .exec()
        .then((result) => {
          log.debug({}, 'allCardsForUser DONE');
          resolve(result);
        })
        .catch(reject)
      })
      .catch(reject);
  });
}
module.exports.allCardsForUser = allCardsForUser;

/*
function allCardIdsForUser(appId, userId) {

}
module.exports.allCardIdsForUser = allCardIdsForUser;
*/

function allDecksForUserConditions(appId, userId) {
  return {
    appId: appId,
    $or: [
      { userId: userId },
      { userIds: userId }
    ]
  }
}

function allDecksForUser(appId, userId) {
  return Deck.find(allDecksForUserConditions(appId, userId))
    .sort('_id')
    .exec();
}
module.exports.allDecksForUser = allDecksForUser;

function allDeckIdsForUser(appId, userId) {
  return new Promise((resolve, reject) => {
    allDecksForUser(appId, userId)
      .then((decks) => {
        resolve(decks.map((deck) => {
          return deck._id;
        }));
      })
      .catch(reject);
  });
}
module.exports.allDeckIdsForUser = allDeckIdsForUser

function deckForUserHelper(appId, userId, deckId, allowPublic) {
  var ors = [
    { userId: userId },
    { userIds: userId }
  ];

  if (allowPublic) {
    ors.push({ public: true });
  }

  return Deck.findOne({
    _id: deckId,
    appId: appId,
    $or: ors
  })
  .exec();
}

function deckForUser(appId, userId, deckId) {
  return deckForUserHelper(appId, userId, deckId, false);
}
module.exports.deckForUser = deckForUser;

function deckForUserOrPublic(appId, userId, deckId) {
  return deckForUserHelper(appId, userId, deckId, true);
}
module.exports.deckForUserOrPublic = deckForUserOrPublic;

function cardForUserHelper(appId, userId, cardId, allowPublic) {
  userId = parseInt(userId);

  return new Promise((resolve, reject) => {
    Card.findOne({
      _id: cardId,
      appId: appId
    })
    .populate('_deck')
    .exec()
    .then((card) => {
      // TODO: test all branches of this ugly if
      if (card && (card.userId == userId || 
        (card._deck && 
          (card._deck.userId == userId || card._deck.userIds.includes(userId)) ||
          (allowPublic && card._deck.public)))) 
      {
        resolve(card);
      } else {
        resolve(null);
      }
    })
    .catch(reject)
  });
   
}

function cardForUser(appId, userId, cardId) {
  return cardForUserHelper(appId, userId, cardId, false);
}
module.exports.cardForUser = cardForUser;

function cardForUserOrPublic(appId, userId, cardId) {
  return cardForUserHelper(appId, userId, cardId, true);
}
module.exports.cardForUserOrPublic = cardForUserOrPublic;

function addUserToDeck(appId, reqUserId, addUserId, deckId) {
  return deckUserHelper(appId, reqUserId, addUserId, deckId, '$addToSet');
}
module.exports.addUserToDeck = addUserToDeck;

function removeDeckUser(appId, reqUserId, removeUserId, deckId) {
  return deckUserHelper(appId, reqUserId, removeUserId, deckId, '$pull');
}
module.exports.removeDeckUser = removeDeckUser;

function deckUserHelper(appId, reqUserId, updateUserId, deckId, op) {
  var errMsg = 'Deck not found (userId: ' + reqUserId + ', deckId: ' + deckId + ')';

  return deckForUser(appId, reqUserId, deckId)
    .then((deck) => {
      if (!deck) {
        throw new TypeError(errMsg);
      }

      return deck.update({
        [op]: { userIds: updateUserId }
      }).exec().then(() => { 
        return Deck.findOne({
          _id: deck._id
        }).exec();
      });
    });
}

function publicDecks(appId) {
  return Deck.find({
    appId: appId,
    public: true
  }).exec();
}
module.exports.publicDecks = publicDecks;

function publicCards(appId) {
  return publicDecks(appId)
    .then((decks) => {
      return Card.find({
        _deck: { $in: decks }
      })
      .populate('_deck')
      .select(cardSummaryFields)
      .exec()
    });
};
module.exports.publicCards = publicCards;
