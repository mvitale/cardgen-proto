var urlHelper = require('../../url-helper');

module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  cb(null, { url: urlHelper.staticImageUrl("eol-logo.png") });
}
