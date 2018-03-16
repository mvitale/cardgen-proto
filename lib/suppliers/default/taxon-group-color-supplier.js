var reqlib = require('app-root-path').require;
var taxonGroupUtil = reqlib('lib/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, choices, tips, cb) {
  var choiceKey = data.taxon.selfTaxonGroupKey || 
    data.taxon.taxonGroupKey || 
    choices[0].choiceKey;

  return cb(null, null, choiceKey);
}
