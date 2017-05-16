var resUtils = require('_/routes/util/res-utils')
  , deck = require('_/models/deck')
  , MongooseWrapper = require('_/api-wrappers/mongoose-wrapper')
  , Deck = deck.Deck
  ;

function createDeck(req, res) {
  var deckData = Object.assign({ userId: req.params.userId }, req.body);

  deck.Deck.create(deckData, (err, deck) => {
    if (err) return resUtils.errJsonRes(res, err);

    resUtils.jsonRes(res, resUtils.httpStatus.created, new MongooseWrapper(deck));
  });
}
module.exports.createDeck = createDeck;

function decksForUser(req, res) {
  Deck.find({ userId: req.params.userId }).sort('-_id').exec((err, decks) => {
    if (err) return resUtils.errJsonRes(res, err);

    var wrappedDecks = [];

    decks.forEach((deck) => {
      wrappedDecks.push(new MongooseWrapper(deck));
    });

    resUtils.jsonRes(res, resUtils.httpStatus.ok, wrappedDecks);
  });
}
module.exports.decksForUser = decksForUser;
