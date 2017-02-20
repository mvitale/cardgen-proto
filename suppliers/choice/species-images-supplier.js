var targetDataType = 'http://purl.org/dc/dcmitype/StillImage';

module.exports.supply = function(params, apiResults, cb) {
  var response = apiResults['pages']['response']
    , dataObjects = response['dataObject']
    , imageUrls = [];

  dataObjects.forEach((dataObj) => {
    if (dataObj['dataType'].includes(targetDataType)) {
      imageUrls.push(dataObj['mediaURL'][1]); // EOL-cached version of image
    }
  });

  cb(null, imageUrls);
}
