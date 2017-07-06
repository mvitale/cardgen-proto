var urlHelper = require('_/url-helper');

module.exports.supply = function(params, apiResults, choices, tips, cb) {
  cb(null, { url: urlHelper.staticImageUrl("eol-logo.png") });
}
