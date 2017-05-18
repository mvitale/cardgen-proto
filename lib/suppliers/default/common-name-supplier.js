var targetLang = 'en';

/*
 * Throws TypeError if apiResults.pages is not an Object
 */
module.exports.supply = function(params, apiResults, choices, cb) {
  var commonNames = apiResults.pages.vernacularNames
    , candidate = null;

    if (commonNames) {
      for (var i = 0; i < commonNames.length; i++) {
        var commonName = commonNames[i]
          , lang = commonName.language
          , preferred = commonName.eol_preferred;

        if (lang === targetLang) {
          if (candidate === null || preferred) {
            candidate = commonName.vernacularName;
          }

          if (preferred) {
            break;
          }
        }
      }
    }

    if (candidate === null) { candidate = '' };

    return cb(null, { text: candidate.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })});
}