var taxonGroupUtil = require('_/suppliers/shared/taxon-group');

module.exports.supply = function(params, apiResults, choices, tips, cb) {
  var taxonGroup = taxonGroupUtil.hierarchyDisplayName(apiResults, false)
    , result
    ;

  if (taxonGroup === null) {
    taxonGroup = '';
  }


  cb(null, { text: taxonGroup });
}
