/*
 * Card
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var templateManager = require('../template-manager');

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

      this.defaultData = data['defaultData'];
      this.choices = data['choices'];
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

module.exports = mongoose.model('Card', cardSchema);
