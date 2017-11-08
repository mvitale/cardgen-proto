var reqlib = require('app-root-path').require;
var dataUtils = reqlib('lib/data-utils/data-utils');

/*
 * Throws TypeError if apiResults.pages is undefined.
 */
module.exports.supply = function(params, data, locale, cb) {
  var results = []
    , usedKeys = {}
    ;

  data.images.forEach((image) => {
    var choiceKey = image.url;

    if (!(choiceKey in usedKeys)) {
      results.push(Object.assign({
        choiceKey: choiceKey
      }, image));
      usedKeys[choiceKey] = true;
    }
  })

  return cb(null, results);
}
