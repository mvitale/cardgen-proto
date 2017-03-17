var eolApiCaller = require('./eol-api-caller');

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

module.exports.supply = function(templateParams, cb) {
  var results = {}
    , pagesParams = Object.assign(
        {id: templateParams.speciesId},
        basePagesParams)
    ;

  eolApiCaller.getJson('pages', pagesParams, (err, result) => {
    if (err) return cb(err);

    var hierarchyParams = Object.assign({id: result.taxonConcepts[0].identifier});

    results.pages = result;

    eolApiCaller.getJson('hierarchy_entries', hierarchyParams, (err, result) => {
      if (err) return cb(err);

      results.hierarchy_entries = result;

      return cb(null, results);
    });
  });
}
