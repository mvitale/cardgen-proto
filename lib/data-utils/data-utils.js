var reqlib = require('app-root-path').require;
function parseImages(pagesResult) {
  var targetDataType = 'http://purl.org/dc/dcmitype/StillImage'
    , licenseRegex =
        /http:\/\/creativecommons.org\/licenses\/((?!publicdomain)[a-z\-]+)\//
    , imgUrlRegex =
      /^(https?:\/\/(([^\/]+)\/)+([0-9]+)_)orig(.jpg)/
    , imgUrlFirstGroupIndex = 1
    , imgUrlLastGroupIndex = 5
    , fullSizeImgDimPart = '580_360'
    , thumbImgDimPart = '130_130'
    , dataObjects = pagesResult.dataObjects
    , images = []
    ;

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

  return images;
}
module.exports.parseImages = parseImages;

function parseCommonName(pagesResult, locale) {
  var commonNames = pagesResult.vernacularNames
    , localeSepIndex = locale.indexOf('-')
    , candidate = null
    , result = null
    , targetLang = locale
    ;

  if (localeSepIndex >= 0) {
    targetLang = locale.slice(0, localeSepIndex);
  }

  if (commonNames) {
    for (var i = 0; i < commonNames.length; i++) {
      var commonName = commonNames[i]
        , lang = commonName.language
        , preferred = commonName.eol_preferred
        ;

      if (lang === targetLang) {
        if (candidate === null || preferred) {
          candidate = commonName.vernacularName;
        }

        if (preferred) {
          break;
        }
      }
    }
  }

  if (candidate !== null) {
    result = candidate.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  return result;
}
module.exports.parseCommonName = parseCommonName;
