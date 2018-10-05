var reqlib = require('app-root-path').require;
var dataUtils = reqlib('lib/data-utils/data-utils');
var targetLang = 'en';

/*
 * Throws TypeError if apiResults.pages is not an Object
 */
module.exports.supply = function(params, data, locale) {
  return new Promise((resolve, reject) => {
    var results = [];

    if (data.taxon.commonName) {
      results.push({
        text: data.taxon.commonName,
        choiceKey: data.taxon.commonName,
      });
    }

    resolve({
      choices: results
    });
  });
}
