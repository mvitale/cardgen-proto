var reqlib = require('app-root-path').require;
var resUtils = reqlib('lib/routes/util/res-utils')
  , eolApiCaller = reqlib('lib/api-callers/eol-api-caller')
  , dataUtils = reqlib('lib/data-utils/data-utils')
  ;

function taxonSummary(req, res) {
  eolApiCaller.getJson('pages', {
    id: req.params.id,
    images_per_page: 1,
    images_page: 1,
    common_names: true,
    details: true,
    videos_page: 0,
    sounds_page: 0,
    maps_page: 0,
    texts_page: 0
  }, req.log, function(err, data) {
    var images
      , image
      , commonName
      , result = {}
      ;

    if (err) {
      return resUtils.errJsonRes(res, err);
    }

    images = dataUtils.parseImages(data);
    commonName = dataUtils.parseCommonName(data);

    result.commonName = commonName;
    result.thumbUrl = images.length ? images[0].thumbUrl : null;

    resUtils.jsonRes(res, resUtils.httpStatus.ok, result);
  });
}
module.exports.taxonSummary = taxonSummary;
