var taxonGroupUtil = require('_/suppliers/shared/taxon-group')
  , i18n = require('_/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, taxonGroupUtil.taxonGroupKeys().map((key) => {
    return {
      text: i18n.t(locale, 'taxa.' + key),
      choiceKey: key
    }
  }));
};
