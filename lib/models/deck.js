var reqlib = require('app-root-path').require;
/*
 * Deck of cards
 */
var mongoose = require('mongoose');
var beautifyUnique = require('mongoose-beautiful-unique-validation');
var Schema = mongoose.Schema;
var Card = reqlib('lib/models/card');

var deckSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Number, required: true },
  titleCardId: { type: String },
  cardIds: { type: Array },
  appId: {
    type: String,
    required: true
  },
  desc: { type: String }
});

deckSchema.methods.cards = function(cb) {
  Card.find({ _deck: this })
    .sort('-_id')
    .populate('_deck')
    .exec(cb);
};

deckSchema.index({name: 1, userId: 1}, { unique: "Name taken" });

deckSchema.post('init', (deck, next) => {
  Card.find({ _deck: deck })
    .sort('-_id')
    .exec()
    .then((cards) => {
      deck.cardIds = cards.map((card) => {
        return card._id;
      });

      if (!deck.titleCardId && cards.length) {
        deck.titleCardId = cards[0]._id
      }

      next();
    })
    .catch(next);
});

deckSchema.statics.new = function(data) {
  var that = this;
  return new that(data);
};

deckSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Deck', deckSchema);
