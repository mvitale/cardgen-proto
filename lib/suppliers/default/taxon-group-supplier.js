var reqlib = require('app-root-path').require;
var taxonGroupUtil = reqlib('lib/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, choices, tips, locale, cb) {
  cb(null, null, data.taxon.taxonGroupKey);
}
