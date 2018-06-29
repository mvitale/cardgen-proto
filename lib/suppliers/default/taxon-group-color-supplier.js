var reqlib = require('app-root-path').require;
var taxonGroupUtil = reqlib('lib/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, choices, tips, locale, cb) {
  var choiceKey = data.taxon.selfTaxonGroupKey || 
    data.taxon.taxonGroupKey || 
    choices[choices.length - 1].choiceKey; // XXX: this is fragile!

  return cb(null, null, choiceKey);
}
