var templateManager = require('./template-manager');

module.exports.supply = function(templateName, cb) {
  return templateManager.getTemplate(templateName, (err, template) => {
    if (err) return cb(err);

    return cb(null, template['cardDesc']);
  });
}
