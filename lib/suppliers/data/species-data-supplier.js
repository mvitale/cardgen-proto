var verror = require('verror');

var VError = verror.VError;

var eolApiCaller = require('_/api-callers/eol-api-caller')
  , dataUtils = require('_/data-utils/data-utils')
  , taxonGroup = require('_/suppliers/shared/taxon-group')
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

var apiCaller = eolApiCaller;

// For supplying canned data for integration tests
module.exports._setApiCaller = function(theApiCaller) {
  // TODO: NODE_ENV check - throw if not in test
  apiCaller = theApiCaller;  
}

module.exports._resetApiCaller = function() {
  apiCaller = eolApiCaller; 
}

// Exposed only for generating test data for use in integration tests
module.exports._makeApiCalls = function(templateParams, cb) {
  var pagesParams = Object.assign(
        {id: templateParams.speciesId},
        basePagesParams)
    , taxonConcepts
    , taxonConcept
    , hierarchyParams
    ;

  apiCaller.getJson('pages', pagesParams, (err, pagesResult) => {
    if (err) {
      return cb(new VError(err, callFailedErrorFormat, 'pages'));
    }

    if (!('taxonConcepts' in pagesResult)) {
      return cb(new VError('taxonConcepts missing in pages result'));
    }

    taxonConcepts = pagesResult.taxonConcepts;

    if (taxonConcepts.length === 0) {
      return cb(new VError('taxonConcepts empty in pages result'));
    }

    taxonConcept = taxonConcepts[0];

    if (!('identifier' in taxonConcept)) {
      return cb(new VError('taxonConcepts first element missing identifier'));
    }

    hierarchyParams = {
      id: taxonConcept.identifier
    };

    apiCaller.getJson('hierarchy_entries', hierarchyParams, (err, hierarchyResult) => {
      if (err) {
        return cb(new VError(err, callFailedErrorFormat, 'hierarchy_entries'));
      }

      cb(null, {
        pages: pagesResult,
        hierarchyEntries: hierarchyResult
      });
    });
  });
}

module.exports.supply = function(templateParams, cb) {
  var pagesParams = Object.assign(
        {id: templateParams.speciesId},
        basePagesParams)
    , taxonConcepts
    , taxonConcept
    , hierarchyParams
    , scientificName
    , taxonRank
    ;

  apiCaller.getJson('pages', pagesParams, (err, pagesResult) => {
    if (err) {
      return cb(new VError(err, callFailedErrorFormat, 'pages'));
    }

    if (!('taxonConcepts' in pagesResult)) {
      return cb(new VError('taxonConcepts missing in pages result'));
    }

    taxonConcepts = pagesResult.taxonConcepts;

    if (taxonConcepts.length === 0) {
      return cb(new VError('taxonConcepts empty in pages result'));
    }

    taxonConcept = taxonConcepts[0];

    if (!('identifier' in taxonConcept)) {
      return cb(new VError('taxonConcepts first element missing identifier'));
    }

    hierarchyParams = {
      id: taxonConcept.identifier
    };

    apiCaller.getJson('hierarchy_entries', hierarchyParams, (err, hierarchyResult) => {
      if (err) {
        return cb(new VError(err, callFailedErrorFormat, 'hierarchy_entries'));
      }

      taxonRank = taxonConcept.taxonRank.toLowerCase();
      scientificName = taxonConcept.scientificName;

      return cb(null, {
        taxon: {
          commonName: dataUtils.parseCommonName(pagesResult),
          scientificName: scientificName,
          taxonRank: taxonRank,
          taxonGroupKey: taxonGroup.lowestTaxonGroupKey(hierarchyResult.ancestors),
          selfTaxonGroupKey: taxonGroup.taxonGroupKey(taxonRank, scientificName)
        },
        images: dataUtils.parseImages(pagesResult)
      });
    });
  });
}
