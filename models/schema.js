/*
 * All mongoose Schemas
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
  filename: String,
  digest: { type: String, index: true}
});

module.exports.imageSchema = imageSchema;
