var reqlib = require('app-root-path').require
  , iucnStatus = reqlib('lib/suppliers/iucn-status')
  , i18n = reqlib('lib/i18n')
  ;

var items = iucnStatus.items();

module.exports.supply = function(params, data, locale, cb) {
  return cb(null, items.map(function(item) {
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

