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
