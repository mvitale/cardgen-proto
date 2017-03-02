var urlHelper = require('../../url-helper');

var eolLogoUrl = "http://comm.archive.mbl.edu/news/press_releases/images/eol_logo_globe.jpg"

module.exports.supply = function(params, apiResults, cb) {
  cb(null, urlHelper.staticImageUrl("eol-logo.png"));
}
