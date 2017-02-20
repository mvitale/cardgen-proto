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
  data: Object
});

CardSchema.methods.populateDefaults = function(cb) {
  if (!this.templateParams) {
    this.templateParams = {};
  }

  templateManager.getDefaultData(this.template, this.templateParams,
    (err, data) => {
      if (err) return cb(err);

      this.defaultData = data;
      return cb();
    }
  );
}

module.exports = mongoose.model('Card', CardSchema);
