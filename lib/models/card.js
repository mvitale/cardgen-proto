/*
 * Card
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var templateManager = require('_/template-manager');

var cardSchema = new Schema({
  templateName: {
    type: String,
    required: true
  },
  templateParams: {
    type: Object,
    default: {}
  },
  defaultData: {
    type: Object,
    default: {}
  },
  choices: {
    type: Object,
    default: {}
  },
  data: {
    type: Object,
    required: true,
    default: {}
  },
  userId: {
    type: Number,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 0
  },
  _deck: {
    type: Schema.Types.ObjectId,
    ref: 'Deck'
  }
});

cardSchema.methods.populateDefaultsAndChoices = function(cb) {
  templateManager.getDefaultAndChoiceData(this.templateName, this.templateParams,
    (err, data) => {
      if (err) return cb(err);

      this.defaultData = data.defaultData;
      this.choices = data.choices;
      return cb();
    }
  );
};

cardSchema.methods.templateSpec = function(cb) {
  templateManager.getTemplate(this.templateName, (err, data) => {
    if (err) return cb(err);

    return cb(data['spec']);
  });
};

var Card = mongoose.model('Card', cardSchema);

module.exports.new = function(data) {
  return new Card(data);
}

module.exports.Card = Card;
