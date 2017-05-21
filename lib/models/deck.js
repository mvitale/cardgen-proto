/*
 * Deck of cards
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Card = require('_/models/card').Card;

var deckSchema = new Schema({
 name: { type: String, required: true },
 userId: { type: Number, required: true },
 titleCardId: { type: String }
});

deckSchema.methods.cards = function(cb) {
  Card.find({ _deck: this })
    .sort('-_id')
    .populate('_deck')
    .exec(cb);
};

deckSchema.post('init', (deck, next) => {
  if (!deck.titleCardId) {
    Card.findOne({ _deck: deck })
      .sort('-_id')
      .exec((err, card) => {
        if (err) return next(err);

        if (card) {
          deck.titleCardId = card._id;
        }

        next();
      }
    );
  } else {
    next();
  }
});

/*
 * XXX: this is certainly not perfect from a concurrency standpoint, so
 * it's always possible that there will be Cards that refer to a deck that doesn't
 * exist.
 */
deckSchema.pre('remove', (next) => {
  var that = this;
  Card.updateMany({ _deck: that._id }, { _deck: null }, next);
});

var Deck = mongoose.model('Deck', deckSchema);

module.exports.new = function(data) {
  return new Deck(data);
}

module.exports.Deck = Deck;
