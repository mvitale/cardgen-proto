var fs = require('fs')
  , path = require('path')
  , flatten = require('flat')
  ;

var langsToTranslations;

var langFileDir = path.join(__dirname, 'config/locales')
  , fallbackLang = 'en'
  ;

function init() {
  var langFileNames = fs.readdirSync(langFileDir)
    , lang
    , rawFile
    ;

  langsToTranslations = {};

  langFileNames.forEach((langFileName) => {
    if (langFileName.endsWith('.json')) {
      lang = langFileName.substring(0, langFileName.indexOf('.'));
      rawFile = fs.readFileSync(path.join(langFileDir, langFileName));
      langsToTranslations[lang] = flatten(JSON.parse(rawFile));
    }
  });

  console.log('Loaded translations for ' +
    Object.keys(langsToTranslations).join(', ')
  );
}
module.exports.init = init;

function t(lang, key) {
  var translationsForLang = langsToTranslations[lang];

  if (translationsForLang && key in translationsForLang) {
    return translationsForLang[key];
  } else if (lang !== fallbackLang) {
    return t(fallbackLang, key);
  } else {
    return key;
  }
}
module.exports.t = t;
