var reqlib = require('app-root-path').require;
var taxonGroupUtil = reqlib('lib/suppliers/shared/taxon-group')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, taxonGroupUtil.taxonGroupKeys().map((key) => {
    return {
      text: i18n.t(locale, 'taxa.' + key),
      choiceKey: key
    }
  }));
};
