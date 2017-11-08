var reqlib = require('app-root-path').reqlib;
var urlHelper = require('_/url-helper');

module.exports.supply = function(params, data, choices, tips, cb) {
  cb(null, { url: urlHelper.staticImageUrl("eol-logo.png") });
}
