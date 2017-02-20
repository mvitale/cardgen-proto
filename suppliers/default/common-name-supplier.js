var request = require('request');
var parseXmlString = require('xml2js').parseString;

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

var url = 'http://eol.org/api/pages';

module.exports.supply = function(params, apiResults, choices, cb) {
  var result = apiResults['pages']
    , taxonConcept = result['response']['taxonConcept'][0]
    , commonNames = taxonConcept['commonName'];

    var candidate = null;

    for (var i = 0; i < commonNames.length; i++) {
      var commonName = commonNames[i]
        , attrs = commonName['$']
        , lang = attrs['xml:lang']
        , preferred = attrs['eol_preferred'];

      if (lang === 'en') {
        if (candidate === null || preferred) {
          candidate = commonName['_'];
        }

        if (preferred) {
          break;
        }
      }
    }

    return cb(null, candidate.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }));
}
