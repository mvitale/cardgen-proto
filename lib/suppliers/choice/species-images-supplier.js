var dataUtils = require('_/data-utils/data-utils');

/*
 * Throws TypeError if apiResults.pages is undefined.
 */
module.exports.supply = function(params, apiResults, cb) {
  var results = []
    , usedKeys = {}
    ;

  dataUtils.parseImages(apiResults.pages).forEach((result) => {
    var choiceKey = result.url;

    if (!(choiceKey in usedKeys)) {
      results.push(Object.assign({
        choiceKey: choiceKey
      }, result));
      usedKeys[choiceKey] = true;
    }
  });

  return cb(null, results);
}
