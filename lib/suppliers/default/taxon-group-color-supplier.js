var reqlib = require('app-root-path').require
  , taxonGroupUtil = reqlib('lib/suppliers/shared/taxon-group')
  ;

module.exports.supply = function(params, data, choices, tips, locale) {
  return new Promise((resolve, reject) => {
    var choiceKey = data.taxon.selfTaxonGroupKey || 
      data.taxon.taxonGroupKey || 
      choices[choices.length - 1].choiceKey; // XXX: this is fragile!

    resolve({
      choiceKey: choiceKey
    });
  });
}
