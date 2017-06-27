/*
 * Deck of cards
 */
var mongoose = require('mongoose');
var beautifyUnique = require('mongoose-beautiful-unique-validation');
var Schema = mongoose.Schema;
var Card = require('_/models/card');

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

deckSchema.index({name: 1, userId: 1}, { unique: "Name taken" });

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


deckSchema.statics.new = function(data) {
  var that = this;
  return new that(data);
};

deckSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Deck', deckSchema);
