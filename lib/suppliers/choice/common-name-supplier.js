var dataUtils = require('_/data-utils/data-utils');

var targetLang = 'en';

/*
 * Throws TypeError if apiResults.pages is not an Object
 */
module.exports.supply = function(params, apiResults, cb) {
  var commonName = dataUtils.parseCommonName(apiResults.pages)
    , results = []
    ;

  if (commonName) {
    results.push({ text: commonName });
  }

  cb(null, results);
}
