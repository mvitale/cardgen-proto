var reqlib = require('app-root-path').require;
var config = require('_/config/config')
  , i18n = require('_/i18n')
  ;

process.env.NODE_ENV='test';

config.load();
i18n.init();

var templateManager = require('_/template-manager');
templateManager.load();
