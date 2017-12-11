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
    .sort('-_id')
    .exec();
}
module.exports.allDecksForUser = allDecksForUser;

function allDeckIdsForUser(appId, userId) {
  return Deck.find(allDecksForUserConditions(appId, userId))
    .select('_id')
    .exec();
}
module.exports.allDeckIdsForUser = allDeckIdsForUser

function deckForUser(deckId, userId) {
  return Deck.findOne({
    _id: deckId,
    $or: [
      { userId: userId },
      { userIds: userId }
    ]
  })
  .exec()
}
module.exports.deckForUser = deckForUser;

