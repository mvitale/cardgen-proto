var taxonGroupUtil = require('_/suppliers/shared/taxon-group')
  , traits = require('_/suppliers/shared/traits')
  ;

module.exports.supply = function(params, data, choices, tips, cb) {
  var classLatinName = taxonGroupUtil.hierarchyDisplayName(data)
    , traitNames = traits.traitsForTaxonGroup(classLatinName)
    , traitData = traitNames.map((traitName) => {
        return { key: { text: traitName }, val: { text: '' } };
      })
    ;

  console.log('traitData', traitData)

  cb(null, traitData);
}
