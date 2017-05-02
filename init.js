// Initialization function. Should be called before everything else in
// application.

var config = require('./config/config');
var mongoose = require('mongoose');
var templateManager = require('./template-manager');

module.exports = function() {
  mongoose.Promise = Promise; // Stop mongoose from whining
  templateManager.load();
  config.load();
};
