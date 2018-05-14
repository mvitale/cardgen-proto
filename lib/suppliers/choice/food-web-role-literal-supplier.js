var reqlib = require('app-root-path').require
  , i18n = reqlib('lib/i18n') 
  ;

/*
 * Throws TypeError if apiResults.pages is not an Object
 */
module.exports.supply = function(params, data, locale, cb) {
  cb(null, [{
    text: i18n.t(locale, 'template.values.foodWebRole'),
    choiceKey: 0
  }]);
}
