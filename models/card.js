/*
 * Wrapper for card data
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var templateManager = require('../template-manager');

var CardSchema = new Schema({
  template: {
    type: String,
    required: true
  },
  templateParams: Object,
  defaultData: Object,
  choices: Object,
  data: Object
});

CardSchema.methods.populateDefaultsAndChoices = function(cb) {
  if (!this.templateParams) {
    this.templateParams = {};
  }

  templateManager.getDefaultAndChoiceData(this.template, this.templateParams,
    (err, data) => {
      if (err) return cb(err);

      this.defaultData = data['defaultData'];
      this.choices = data['choices'];
      return cb();
    }
  );
}

module.exports = mongoose.model('Card', CardSchema);
