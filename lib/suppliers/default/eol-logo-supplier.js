var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper');

module.exports.supply = function(params, data, choices, tips, cb) {
  cb(null, { url: urlHelper.staticImageUrl("eol-logo.png") });
}
