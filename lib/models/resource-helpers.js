var reqlib = require('app-root-path').require;
var Card = reqlib('lib/models/card');
var Deck = reqlib('lib/models/deck');

function allCardsForUser(appId, userId) {
  return new Promise((resolve, reject) => {
    allDeckIdsForUser(appId, userId)
      .then((deckIds) => {
        Card.find({
          appId: appId,
          $or: [
            { userId: userId, _deck: null },
            { _deck: { $in: deckIds } }
          ] 
        })
        .sort('_id')
        .populate('_deck')
        .exec()
        .then(resolve)
        .catch(reject)
      })
      .catch(reject);
  });
}
module.exports.allCardsForUser = allCardsForUser;

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

function deckForUser(appId, userId, deckId) {
  return Deck.findOne({
    _id: deckId,
    appId: appId,
    $or: [
      { userId: userId },
      { userIds: userId }
    ]
  })
  .exec();
}
module.exports.deckForUser = deckForUser;

function cardForUser(appId, userId, cardId) {
  return new Promise((resolve, reject) => {
    Card.findOne({
      _id: cardId,
      appId: appId
    })
    .populate('_deck')
    .exec()
    .then((card) => {
      // TODO: test all branches of this ugly if
      if (card && (card.userId === userId || 
          (card._deck && 
            (card._deck.userId === userId || card._deck.userIds.includes(userId))))
      ) {
        resolve(card);
      } else {
        resolve(null);
      }
    })
    .catch(reject)
  });
}
module.exports.cardForUser = cardForUser;
