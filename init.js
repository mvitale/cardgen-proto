// Initialization function. Should be called before everything else in
// application.

var config = require('_/config/config');

var mongoose = require('mongoose');


module.exports = function(cb) {
  mongoose.Promise = Promise; // Stop mongoose from whining

  config.load();

  var templateManager = require('_/template-manager');
  var dbconnect = require('_/dbconnect');
  var auth = require('_/auth');

  templateManager.load();
  auth.init();
  dbconnect.mongooseInit(cb);
};
