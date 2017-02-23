/*
 * Wrapper for card data
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var templateManager = require('../template-manager');

var CardSchema = new Schema({
  templateName: {
    type: String,
    required: true
  },
  fields: {
    type: Object,
    default: {}
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
    default: {}
  }
});

CardSchema.methods.populateDefaultsAndChoices = function(cb) {
  templateManager.getTemplate(this.templateName, (err, template) => {
    if (err) return cb(err);

    this.fields = template['cardDesc']['fields'];

    templateManager.getDefaultAndChoiceData(this.templateName, this.templateParams,
      (err, data) => {
        if (err) return cb(err);

        this.defaultData = data['defaultData'];
        this.choices = data['choices'];
        return cb();
      }
    );
  });
}

module.exports = mongoose.model('Card', CardSchema);
