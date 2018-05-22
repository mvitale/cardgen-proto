var reqlib = require('app-root-path').require
  , i18n = reqlib('lib/i18n')
  , iucnStatus = reqlib('lib/suppliers/iucn-status')
  ;

var choices = iucnStatus.items();

module.exports.supply = function(params, data, locale, cb) {
  cb(null, choices.map(function(choice) {
    var label = i18n.t(locale, choice.labelKey)
      , menuLabel = i18n.t(locale, choice.menuLabelKey)
      , text = i18n.t(locale, choice.textKey)
      ;

    return {
      label: label,
      menuLabel: menuLabel,
      text: text,
      bgColor: choice.bgColor,
      choiceKey: choice.choiceKey
    }
  }));
};
