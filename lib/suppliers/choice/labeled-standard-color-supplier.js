var reqlib = require('app-root-path').require
  , standardColors = reqlib('lib/suppliers/choice/shared/standard-colors')
  , i18n = reqlib('lib/i18n')
  ;

var choices = standardColors.choices();

module.exports.supply = function(params, data, locale) {
  return new Promise((resolve, reject) => {
    resolve({
      choices: choices
      choiceTips: choices.map(choice => {
        var text = null;

        if (!choice.choiceKey.startsWith('*')) {
          text = i18n.t(locale, 'taxa.' + choice.choiceKey);
        }

        return text;
      })
    });
  });
}

