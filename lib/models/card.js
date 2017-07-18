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
  choices: {
    type: Object,
    default: {}
  },
  choiceTips: {
    type: Object,
    default: {}
  },
  data: {
    type: Object,
    required: true,
    default: {}
  },
  userData: {
    type: Object,
    required: true,
    default: {}
  },
  userId: {
    type: Number,
    required: true
  },
  appId: {
    type: String,
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

      this.data = data.defaultData;
      this.choices = data.choices;
      this.choiceTips = data.choiceTips;

      return cb();
    }
  );
};

cardSchema.statics.new = function(data) {
  var that = this;
  return new that(data);
};

module.exports = mongoose.model('Card', cardSchema);
