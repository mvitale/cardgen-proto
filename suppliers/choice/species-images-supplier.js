var targetDataType = 'http://purl.org/dc/dcmitype/StillImage';

module.exports.supply = function(params, apiResults, cb) {
    var dataObjects = apiResults.pages.dataObjects
      , imageUrls = [];

  console.log(dataObjects);

  if (dataObjects) {
    dataObjects.forEach((dataObj) => {
      if (dataObj['dataType'].includes(targetDataType)) {
        imageUrls.push(dataObj.eolMediaURL); // EOL-cached version of image
      }
    });
  }

  cb(null, imageUrls);
}
