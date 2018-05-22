var reqlib = require('app-root-path').require
  , foodWebRoles = reqlib('lib/suppliers/food-web-roles')
  , i18n = reqlib('lib/i18n')
  ;

var roles = foodWebRoles.items();

module.exports.supply = function(params, data, locale, cb) {
  return cb(null, roles.map(function(item) {
    return {
      key: {
        text: i18n.t(locale, item.textKey),
        bgColor: item.bgColor
      },
      val: {
        text: i18n.t(locale, item.menuLabelKey)
      },
      choiceKey: item.choiceKey
    }
  }));
}
