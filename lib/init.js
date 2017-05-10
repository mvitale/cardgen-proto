// Initialization function. Should be called before everything else in
// application.

var config = require('./config/config');
var mongoose = require('mongoose');


module.exports = function(cb) {
  mongoose.Promise = Promise; // Stop mongoose from whining

  config.load();

  var templateManager = require('./template-manager');
  var dbconnect = require('./dbconnect');

  templateManager.load();
  dbconnect.mongooseInit(cb);
};
