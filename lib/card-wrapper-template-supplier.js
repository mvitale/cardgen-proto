/*
 * Template supplier for use with template-renderer
 */

var templateManager = require('_/template-manager');

module.exports.supply = function(templateName, locale, cb) {
  var template = templateManager.getTemplate(templateName, locale);

  if (!template) {
    cb(new Error('Template ' + templateName + ' not found'));
  } else {
    cb(null, template);
  }
}
