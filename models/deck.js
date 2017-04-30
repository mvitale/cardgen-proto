/*
 * Deck of cards
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Card = require('./card');

var deckSchema = new Schema({
 name: { type: String, required: true },
 userId: { type: Number, required: true },
 titleCardId: { type: String }
});

deckSchema.methods.cards = function(cb) {
  return Card.find({ _deck: this })
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

module.exports = mongoose.model('Deck', deckSchema);