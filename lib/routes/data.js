var reqlib = require('app-root-path').require;
var resUtils = reqlib('lib/routes/util/res-utils')
  , eolApiCaller = reqlib('lib/api-callers/eol-api-caller')
  , dataUtils = reqlib('lib/data-utils/data-utils')
  ;

function taxonSearch(req, res, next) {
  eolApiCaller.getJson('search', {
    q: req.params.q,
    page: 1,
    exact: false
  }, req.log, (err, searchData) => {
    var searchResults = []
      , idMap = {}
      , ids
      ;

    if (err) {
      return next(err);
    }

    searchData.results.forEach((result) => {
      if (!idMap[result.id]) {
        idMap[result.id] = true;
        searchResults.push(result);
      }
    });

    ids = Object.keys(idMap);

    eolApiCaller.getJson('pages', {
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
    }, req.log, function(err, detailResult) {
      var images
        , image
        , commonName
        ;

      if (err) {
        return next(err);
      }

      searchResults.forEach((result) => {
        var taxonDetails = detailResult[result.id];

        if (taxonDetails) {
          images = dataUtils.parseImages(taxonDetails);
          result.thumbUrl = images.length ? images[0].thumbUrl : null;
          result.commonName = dataUtils.parseCommonName(taxonDetails, req.locale);
        }
      })

      resUtils.jsonRes(res, resUtils.httpStatus.ok, searchResults);
    });
  });
}
module.exports.taxonSearch = taxonSearch;
