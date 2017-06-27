var targetDataType = 'http://purl.org/dc/dcmitype/StillImage'
  , licenseRegex =
      /http:\/\/creativecommons.org\/licenses\/((?!publicdomain)[a-z\-]+)\//
  , imgUrlRegex =
    /^(https?:\/\/(([^\/]+)\/)+([0-9]+)_)orig(.jpg)/
  , imgUrlFirstGroupIndex = 1
  , imgUrlLastGroupIndex = 5
  , fullSizeImgDimPart = '580_360'
  , thumbImgDimPart = '130_130'
  ;


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
        , credit = null
        , urlMatches
        , url
        , thumbUrl
        ;

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

        urlMatches = dataObj.eolMediaURL.match(imgUrlRegex);

        if (!urlMatches) {
          // TODO: handle/log error
          return;
        }

        url = urlMatches[imgUrlFirstGroupIndex] +
              fullSizeImgDimPart +
              urlMatches[imgUrlLastGroupIndex];

        thumbUrl = urlMatches[imgUrlFirstGroupIndex] +
                   thumbImgDimPart +
                   urlMatches[imgUrlLastGroupIndex];

        images.push({
          url: url,
          thumbUrl: thumbUrl,
          credit: { text: credit }
        });
      }
    });
  }

  cb(null, images);
}
