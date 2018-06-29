var reqlib = require('app-root-path').require;
var taxonGroupUtil = reqlib('lib/suppliers/shared/taxon-group')
  , traits = reqlib('lib/suppliers/shared/traits')
  , i18n = reqlib('lib/i18n')
  ;

var traitKeyPrefix = 'traits.'

module.exports.supply = function(params, data, choices, tips, locale, cb) {
  var traitKeys = traits.traitKeysForTaxonGroup(data.taxon.taxonGroupKey)
    , traitData = traitKeys.map((traitKey) => {
        var trait = i18n.t(locale, traitKeyPrefix + traitKey);
        return { key: { text: trait }, val: { text: '' } };
      })
    ;

  cb(null, traitData);
}
