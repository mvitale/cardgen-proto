var dataUtils = require('_/data-utils/data-utils');

/*
 * Throws TypeError if apiResults.pages is undefined.
 */
module.exports.supply = function(params, apiResults, cb) {
  cb(null, dataUtils.parseImages(apiResults.pages));
}
