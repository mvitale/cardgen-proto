var verror = require('verror');

var VError = verror.VError;

var eolApiCaller = require('_/eol-api-caller');

var basePagesParams = {
  'videos_page': 0,
  'sounds_page': 0,
  'maps_page': 0,
  'texts_page': 0,
  'images_page': 1,
  'images_per_page': 25,
  'icun': false,
  'taxonomy': false,
  'vetted': 0,
  'language': 'en',
  'details': true,
  'common_names': true,
  'taxonomy': true
}

var baseHierarchyParams = {
  'common_names': false,
  'synonyms': false
}

var callFailedErrorFormat = '%s call failed';

module.exports.supply = function(templateParams, cb) {
  var results = {}
    , pagesParams = Object.assign(
        {id: templateParams.speciesId},
        basePagesParams)
    , taxonConcepts
    , taxonConcept
    , hierarchyParams
    ;

  eolApiCaller.getJson('pages', pagesParams, (err, result) => {
    if (err) {
      return cb(new VError(err, callFailedErrorFormat, 'pages'));
    }

    if (!('taxonConcepts' in result)) {
      return cb(new VError('taxonConcepts missing in pages result'));
    }

    taxonConcepts = result.taxonConcepts;

    if (taxonConcepts.length === 0) {
      return cb(new VError('taxonConcepts empty in pages result'));
    }

    taxonConcept = taxonConcepts[0];

    if (!('identifier' in taxonConcept)) {
      return cb(new VError('taxonConcepts first element missing identifier'));
    }

    hierarchyParams = {id: taxonConcept.identifier};

    results.pages = result;

    eolApiCaller.getJson('hierarchy_entries', hierarchyParams, (err, result) => {
      if (err) {
        return cb(new VError(err, callFailedErrorFormat, 'hierarchy_entries'));
      }

      results.hierarchy_entries = result;

      return cb(null, results);
    });
  });
}
