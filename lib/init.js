var reqlib = require('app-root-path').require;
// Initialization function. Should be called before everything else in
// application.

var config = reqlib('lib/config/config')
  , i18n = reqlib('lib/i18n')
  , cardBackStore = reqlib('lib/card-back-store')
  ;

var mongoose = require('mongoose');

module.exports = function(cb) {
  mongoose.Promise = Promise; // Stop mongoose from whining

  config.load();
  i18n.init();

  var templateManager = reqlib('lib/template-manager');
  var dbconnect = reqlib('lib/dbconnect');
  var auth = reqlib('lib/auth');

  templateManager.load();
  auth.init();
  cardBackStore.init();
  dbconnect.mongooseInit(cb);
};
