var fs = require('fs')
  , path = require('path')
  , flatten = require('flat')
  , config = require('_/config/config')
  ;

var localesToTranslations;

var localeFileDir = path.join(__dirname, 'config/locales')
  , fallbackLocale
  ;

function init() {
  var locales = config.get('i18n.availableLocales')
    , fileName
    , rawFile
    ;

  fallbackLocale = config.get('i18n.defaultLocale');
  localesToTranslations = {};

  locales.forEach((locale) => {
    fileName = locale + '.json';

    try {
      rawFile = fs.readFileSync(path.join(localeFileDir, fileName));
    } catch (e) {
      console.log('Missing translations file for locale ' + locale);
      throw e;
    }

    localesToTranslations[locale] = flatten(JSON.parse(rawFile));
  });

  console.log('Loaded translations for ' +
    locales.join(', ')
  );
}
module.exports.init = init;

function t(locale, key) {
  var translationsForLocale = localesToTranslations[locale];

  if (translationsForLocale && key in translationsForLocale) {
    return translationsForLocale[key];
  } else if (locale !== fallbackLocale) {
    return t(fallbackLocale, key);
  } else {
    return key;
  }
}
module.exports.t = t;
