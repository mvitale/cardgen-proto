var reqlib = require('app-root-path').require;
/*
 * Template supplier for use with template-renderer
 */

var templateManager = require('_/template-manager');

module.exports.supply = function(templateName, templateVersion, locale, cb) {
  var template = templateManager.getTemplate(templateName, templateVersion, locale);

  if (!template) {
    cb(new Error('Template ' + templateName + ' not found'));
  } else {
    cb(null, template);
  }
}
