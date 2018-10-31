var reqlib = require('app-root-path').require;
// Initialization function. Should be called before everything else in
// application.

var config = reqlib('lib/config/config')
  , i18n = reqlib('lib/i18n')
  , bugsnag = require('bugsnag')
  , mongoose = require('mongoose')
  ;

module.exports = function(cb) {
  mongoose.Promise = Promise; // Stop mongoose from whining

  config.load();
  i18n.init();

  var templateManager = reqlib('lib/template-manager')
    , dbconnect = reqlib('lib/dbconnect')
    , auth = reqlib('lib/auth')
    , textRenderer = reqlib('lib/opentype-text-renderer')
    , cardBackStore = reqlib('lib/card-back-store')
    ;

  textRenderer.loadFonts();
  auth.init();
  cardBackStore.init();
  templateManager.load()
  .then(() => {
    return dbconnect.mongooseInit();
  }).then(() => {
    cb()
  }).catch(cb);
};
