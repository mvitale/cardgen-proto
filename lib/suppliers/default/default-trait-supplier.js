var taxonGroupUtil = require('_/suppliers/shared/taxon-group')
  , traits = require('_/suppliers/shared/traits')
  ;

module.exports.supply = function(params, apiResults, choices, tips, cb) {
  var classLatinName = taxonGroupUtil.hierarchyDisplayName(apiResults)
    , traitNames = traits.traitsForTaxonGroup(classLatinName)
    , traitData = traitNames.map((traitName) => {
        return { key: { text: traitName }, val: { text: '' } };
      })
    ;

  cb(null, traitData);
}
