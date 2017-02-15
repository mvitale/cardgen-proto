/*
 * Image
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
  filename: String,
  digest: { type: String, index: true},
  size: Number
});

module.exports = mongoose.model(imageSchema);
