var reqlib = require('app-root-path').require;
var taxonGroupUtil = require('_/suppliers/shared/taxon-group')
  , traits = require('_/suppliers/shared/traits')
  ;

module.exports.supply = function(params, data, choices, tips, cb) {
  var traitNames = traits.traitsForTaxonGroup(data.taxon.taxonGroupKey)
    , traitData = traitNames.map((traitName) => {
        return { key: { text: traitName }, val: { text: '' } };
      })
    ;

  cb(null, traitData);
}
