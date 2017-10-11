var taxonGroupUtil = require('_/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, choices, tips, cb) {
  var taxonGroup = taxonGroupUtil.hierarchyDisplayName(data, false)
    , result
    ;

  if (taxonGroup === null) {
    taxonGroup = '';
  }


  cb(null, { text: taxonGroup });
}
