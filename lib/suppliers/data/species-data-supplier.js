var verror = require('verror');

var VError = verror.VError;

var eolApiCaller = require('_/api-callers/eol-api-caller')
  , dataUtils = require('_/data-utils/data-utils')
  ;

var basePagesParams = {
  'videos_page': 0,
  'sounds_page': 0,
  'maps_page': 0,
  'texts_page': 0,
  'images_page': 1,
  'images_per_page': 50,
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

    results.images = dataUtils.parseImages(result);

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

    results.taxon = buildTaxonData(taxonConcept, dataUtils.parseCommonName(result));
    hierarchyParams = {id: taxonConcept.identifier};

    eolApiCaller.getJson('hierarchy_entries', hierarchyParams, (err, result) => {
      if (err) {
        return cb(new VError(err, callFailedErrorFormat, 'hierarchy_entries'));
      }

      results.ancestors = result.ancestors.map((ancestor) => {
        return buildTaxonData(ancestor);
      });

      return cb(null, results);
    });
  });
}

function buildTaxonData(rawData, commonName) {
  var result =  {
    scientificName: rawData.scientificName,
    taxonRank: rawData.taxonRank.toLowerCase()
  };

  if (commonName) {
    result.commonName = commonName;
  }

  return result;
}
