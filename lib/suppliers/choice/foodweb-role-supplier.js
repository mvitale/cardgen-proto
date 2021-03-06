var reqlib = require('app-root-path').require
  , urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  , foodWebRoles = reqlib('lib/suppliers/food-web-roles')
  ;

var choices = foodWebRoles.items();

module.exports.supply = function(params, data, locale) {
  return Promise.resolve({
    choices: choices.map(function(choice) {
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
    })
  });
};

