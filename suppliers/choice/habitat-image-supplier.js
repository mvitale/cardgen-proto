var urlHelper = require('../../url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    { url: urlHelper.staticImageUrl('habitat_icons/freshwater.png') },
    { url: urlHelper.staticImageUrl('habitat_icons/marine.png') },
    { url: urlHelper.staticImageUrl('habitat_icons/terrestrial.png') }
  ]);
}
