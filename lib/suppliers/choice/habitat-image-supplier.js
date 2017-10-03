var urlHelper = require('_/url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    {
      url: urlHelper.staticImageUrl('habitat_icons/freshwater.png'),
      choiceKey: 0
    },
    {
      url: urlHelper.staticImageUrl('habitat_icons/marine.png'),
      choiceKey: 1
    },
    {
      url: urlHelper.staticImageUrl('habitat_icons/terrestrial.png'),
      choiceKey: 2
    }
  ]);
}
