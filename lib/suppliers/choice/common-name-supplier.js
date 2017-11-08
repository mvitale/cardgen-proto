var reqlib = require('app-root-path').reqlib;
var dataUtils = require('_/data-utils/data-utils');
var targetLang = 'en';

/*
 * Throws TypeError if apiResults.pages is not an Object
 */
module.exports.supply = function(params, data, locale, cb) {
  var results = [];

  if (data.taxon.commonName) {
    results.push({
      text: data.taxon.commonName,
      choiceKey: data.taxon.commonName,
    });
  }

  cb(null, results);
}
