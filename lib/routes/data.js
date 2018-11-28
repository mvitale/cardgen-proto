var reqlib = require('app-root-path').require
  , resUtils = reqlib('lib/routes/util/res-utils')
  , eolApiCaller = reqlib('lib/api-callers/eol-api-caller')
  , dataUtils = reqlib('lib/data-utils/data-utils')
  ;

function taxonSearch(req, res, next) {
  var searchData
    , detailResult
    , searchResults = []
    ;
  
  return eolApiCaller.getJson('search', {
    q: req.params.q,
    page: 1,
    exact: false
  }, req.log)
  .then((result) => {
    searchData = result;

    var idMap = {}
      , ids
      ;

    searchData.results.forEach((result) => {
      if (!idMap[result.id]) {
        idMap[result.id] = true;
        searchResults.push(result);
      }
    });

    ids = Object.keys(idMap);

    return eolApiCaller.getJson('pages', {
      id: ids.join(','),
      batch: true,
      images_per_page: 1,
      images_page: 1,
      common_names: true,
      details: true,
      videos_page: 0,
      sounds_page: 0,
      maps_page: 0,
      texts_page: 0
    }, req.log);
  })
  .then((result) => {
    detailResult = result;

    var images
      , image
      , commonName
      , idsToDetails = {}
      ;

    detailResult.forEach((detail) => {
      idsToDetails[detail.identifier] = detail;
    });

    searchResults.forEach((result) => {
      var taxonDetails = idsToDetails[result.id];

      if (taxonDetails) {
        images = dataUtils.parseImages(taxonDetails);
        result.thumbUrl = images.length ? images[0].thumbUrl : null;
        result.commonName = dataUtils.parseCommonName(taxonDetails, req.locale);
      } else {
        req.log.error({ identifier: result.id }, 'failed to enrich search result with taxon details');
      }
    });

    resUtils.jsonRes(res, resUtils.httpStatus.ok, searchResults);
  }).catch((next));
}
module.exports.taxonSearch = taxonSearch;

