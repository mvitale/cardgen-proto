/*
 * Deck of cards
 */
var reqlib = require('app-root-path').require;
var mongoose = require('mongoose');
var beautifyUnique = require('mongoose-beautiful-unique-validation');
var Schema = mongoose.Schema;
var Card = reqlib('lib/models/card');

var deckSchema = new Schema({
  name: { type: String, required: true },
  userId: { type: Number, required: true }, // This should really be called ownerId...
  userIds: {
    type: [Number],
    default: [] // TODO: should this be required?
  },
  titleCardId: { type: String },
  cardIds: { type: Array },
  appId: {
    type: String,
    required: true
  },
  desc: { type: String },
  public: { 
    type: Boolean, 
    required: true, 
    default: false 
  },
  locale: {
    type: String,
    required: true
  }
});

deckSchema.methods.cards = function(cb) {
  return Card.find({ _deck: this })
    .sort('-_id')
    .populate('_deck')
    .exec(cb);
};

deckSchema.index({ name: 1, userId: 1 }, { unique: "Name taken" });

deckSchema.statics.new = function(data) {
  var that = this;
  return new that(data);
};

deckSchema.statics.copy = function(orig, userId, name) {
  var copy = new this();

  copy.name = name;
  copy.userId = userId;
  copy.appId = orig.appId;
  copy.desc = orig.desc;
  copy.locale = orig.locale;
  copy.public = false;

  return copy.save()
    .then(() => {
      var promises = [];

      orig.cards().then((cards) => {
        cards.forEach((card) => {
          promises.push(Card.copy(card, userId, copy).save());
        });
      });

      return Promise.all(promises);
    })
    .then(() => {
      return copy; 
    });
}

deckSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Deck', deckSchema);
