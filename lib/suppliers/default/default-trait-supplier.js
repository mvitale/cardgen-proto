var util = require('./util/util')
  , traits = require('_/suppliers/shared/traits')
  ;

module.exports.supply = function(params, apiResults, choices, tips, cb) {
  var classLatinName = util.hierarchyDisplayName(apiResults)
    , traitNames = traits.traitsForTaxonGroup(classLatinName)
    , traitData = traitNames.map((traitName) => {
                    return { key: { text: traitName }, val: { text: '' } };
                  })
    ;

  cb(null, traitData);
}
