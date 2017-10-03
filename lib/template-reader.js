/*
 * Template supplier for use with template-renderer
 */

var templateManager = require('_/template-manager');

module.exports.supply = function(templateName, cb) {
  var template = templateManager.getTemplate(templateName);

  if (!template) {
    cb(new Error('Template ' + templateName + ' not found'));
  } else {
    cb(null, template);
  }
}
