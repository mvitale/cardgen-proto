var taxonGroupUtil = require('_/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, choices, tips, cb) {
  cb(null, null, data.taxon.taxonGroupKey);
}
