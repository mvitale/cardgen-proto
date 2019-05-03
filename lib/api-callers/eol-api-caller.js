var reqlib = require('app-root-path').require
  , request = require('request-promise-native')
  , config = reqlib('lib/config/config')
  ;

var baseUrl = "https://eol.org/api"
  , apiVersion = "1.0"
  ;

var apiKey = config.get('eolApiKey');
if (!apiKey) {
  throw new TypeError("eolApiKey not configured");
}

function getJson(apiName, params, log) {
  var urlParts = [baseUrl, apiName, apiVersion]
    , qs = Object.assign({}, params, { key: apiKey })
    , url
    ;

  if (qs.id) {
    urlParts.push(qs.id);
    delete qs.id;
  }

  url = urlParts.join('/') + '.json'

  log.debug({ apiUrl: url, qs }, `calling ${apiName} API`);

  return request.get({
    url: url, 
    qs: qs
  }).then((body) => {
    var parsed;

    try {
      parsed = JSON.parse(body);
      log.debug({ parsed }, 'API response');
    } catch (e) {
      log.debug({ body }, 'Unparseable response body');
      throw e;
    }

    return parsed;
  });
}
module.exports.getJson = getJson;
