var reqlib = require('app-root-path').require;
var config = reqlib('lib/config/config')
  , i18n = reqlib('lib/i18n')
  , mongoose = require('mongoose')
  ;

module.exports.init = function() {
  process.env.NODE_ENV = 'test';
  config.load();
  i18n.init();
  mongoose.Promise = Promise; // Why is this necessary...?

  var templateManager = reqlib('lib/template-manager');
  return templateManager.load();
}

