/*
 * Deck of cards
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Card = require('./card');

var deckSchema = new Schema({
 name: { type: String, required: true },
 userId: { type: Number, required: true }
});

deckSchema.methods.cards = function(cb) {
  return Card.find({ _deck: this._id })
    .populate('_deck')
    .exec(cb);
}

module.exports = mongoose.model('Deck', deckSchema);
