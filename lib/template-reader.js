/*
 * Template supplier for use with template-renderer
 */

var templateManager = require('_/template-manager');

module.exports.supply = function(templateName, cb) {
  return templateManager.getTemplate(templateName, (err, template) => {
    if (err) return cb(err);

    return cb(null, template['spec']);
  });
}
