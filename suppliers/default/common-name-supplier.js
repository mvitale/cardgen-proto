var request = require('request');

var baseParams = {
  videos_page: 0,
  sounds_page: 0,
  maps_page: 0,
  texts_page: 0,
  icun: false,
  taxonomy: false,
  vetted: 0,
  language: 'en',
  details: false,
  images_page: 0,
  common_names: true
};

module.exports.supply = function(params, apiResults, choices, cb) {
  var commonNames = apiResults.pages.vernacularNames
    , candidate = null;

    if (commonNames) {
      for (var i = 0; i < commonNames.length; i++) {
        var commonName = commonNames[i]
          , lang = commonName.language
          , preferred = commonName.eol_preferred;

        if (lang === 'en') {
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
