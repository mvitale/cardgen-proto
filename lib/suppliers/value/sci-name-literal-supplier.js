var reqlib = require('app-root-path').require
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(locale) {
  return {
    text: i18n.t(locale, 'template.values.sciName')
  }
}
