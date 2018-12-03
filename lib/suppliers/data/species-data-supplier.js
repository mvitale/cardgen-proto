var reqlib = require('app-root-path').require;
var verror = require('verror');

var VError = verror.VError;

var eolApiCaller = reqlib('lib/api-callers/eol-api-caller')
  , dataUtils = reqlib('lib/data-utils/data-utils')
  , taxonGroup = reqlib('lib/suppliers/shared/taxon-group')
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
module.exports._makeApiCalls = function(templateParams, log, cb) {
  var pagesParams = Object.assign(
        {id: templateParams.speciesId},
        basePagesParams)
    , taxonConcepts
    , taxonConcept
    , hierarchyParams
    ;

  apiCaller.getJson('pages', pagesParams, log, (err, pagesResult) => {
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

    apiCaller.getJson('hierarchy_entries', hierarchyParams, log, (err, hierarchyResult) => {
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

module.exports.supply = function(templateParams, log, locale, cb) {
  var pagesParams = Object.assign(
        {id: templateParams.speciesId},
        basePagesParams)
    , taxonConcepts
    , taxonConcept
    , hierarchyParams
    , scientificName
    , taxonRank
    ;

  apiCaller.getJson('pages', pagesParams, log, (err, pagesResult) => {
    if (err) {
      return cb(new VError(err, callFailedErrorFormat, 'pages'));
    }

    // XXX: this is all subject to change -- the switch to v3 introduced some weird api changes, and I'm attempting to work around them.
    if (!('taxonConcept' in pagesResult)) {
      return cb(new VError('taxonConcept missing in pages result'));
    }

    pagesResult = pagesResult.taxonConcept;

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

    taxonRank = taxonConcept.taxonRank ? taxonConcept.taxonRank.toLowerCase() : null;
    scientificName = taxonConcept.scientificName;

    hierarchyParams = {
      id: taxonConcept.identifier
    };

    apiCaller.getJson('hierarchy_entries', hierarchyParams, log, (err, hierarchyResult) => {
      if (err) {
        return cb(new VError(err, callFailedErrorFormat, 'hierarchy_entries'));
      }

      taxonRank = taxonConcept.taxonRank ? taxonConcept.taxonRank.toLowerCase() : null;
      scientificName = taxonConcept.scientificName;

      return cb(null, {
        taxon: {
          commonName: dataUtils.parseCommonName(pagesResult, locale),
          scientificName: scientificName,
          taxonRank: taxonRank,
          taxonGroupKey: taxonGroup.lowestTaxonGroupKey(scientificName, hierarchyResult.ancestors),
          selfTaxonGroupKey: taxonGroup.taxonGroupKey(taxonRank, scientificName)
        },
        images: dataUtils.parseImages(pagesResult)
      });
    });
  });
}

