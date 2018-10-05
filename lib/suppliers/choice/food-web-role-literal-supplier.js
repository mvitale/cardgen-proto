var reqlib = require('app-root-path').require
  , i18n = reqlib('lib/i18n') 
  ;

module.exports.supply = function(params, data, locale) {
  return Promise.resolve({
    choices: [{
      text: i18n.t(locale, 'template.values.foodWebRole'),
      choiceKey: 0
    }]
  });
}

