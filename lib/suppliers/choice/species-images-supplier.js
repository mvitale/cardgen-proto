var targetDataType = 'http://purl.org/dc/dcmitype/StillImage';
var licenseRegex =
  /http:\/\/creativecommons.org\/licenses\/((?!publicdomain)[a-z\-]+)\//;

/*
 * Throws TypeError if apiResults.pages is undefined.
 */
module.exports.supply = function(params, apiResults, cb) {
  var dataObjects = apiResults.pages.dataObjects
    , images = [];

  if (dataObjects) {
    dataObjects.forEach((dataObj) => {
      var rightsHolder = 'Unknown'
        , licenseMatch = null
        , license = null
        , credit = null;

      if (!('dataType' in dataObj)) {
        return;
      }

      if (dataObj['dataType'].includes(targetDataType)) {
        if (!('eolMediaURL' in dataObj)) {
          return;
        }

        if (dataObj.rightsHolder) {
          rightsHolder = dataObj.rightsHolder
        } else if (dataObj.agents) {
          rightsHolder = dataObj.agents[0].full_name
        }

        if (!('license' in dataObj)) {
          return;
        }

        licenseMatch = dataObj.license.match(licenseRegex);

        if (licenseMatch) {
          license = 'CC-' + licenseMatch[1].toUpperCase();
        }
        // Otherwise, assume public domain/no license string necessary

        credit = rightsHolder;

        if (license) {
          credit += ' ' + license;
        }

        images.push({
          url: dataObj.eolMediaURL,
          credit: { text: credit }
        }); // EOL-cached version of image
      }
    });
  }

  cb(null, images);
}