var templateManager = require('./template-manager');

module.exports.supply = function(templateName, cb) {
  return tempalteManager.getTemplate(templateName, cb);
}
