var reqlib = require('app-root-path').require;
var taxonGroupUtil = require('_/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, choices, tips, cb) {
  return cb(null, null, data.taxon.selfTaxonGroupKey || data.taxon.taxonGroupKey);
}
