var reqlib = require('app-root-path').require;
var config = reqlib('lib/config/config')
  , i18n = reqlib('lib/i18n')
  ;

process.env.NODE_ENV = 'test';
config.load();
i18n.init();

var templateManager = reqlib('lib/template-manager');
templateManager.load();
