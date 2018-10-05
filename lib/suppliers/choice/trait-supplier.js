var reqlib = require('app-root-path').require;
var traits = reqlib('lib/suppliers/shared/traits')
  , i18n = reqlib('lib/i18n')
  ;

var traitKeyPrefix = 'traits.';

// TODO: update format of choices (key -> choice)
module.exports.supply = function(params, data, locale) {
  return Promise.resolve({
    choices: traits.allTraits().map((key) => {
      return {
        key: {
          text: i18n.t(locale, traitKeyPrefix + key)
        }, 
        choiceKey: key
      }
    })
  });
};

