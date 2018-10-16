var reqlib = require('app-root-path').require
  , request = require('request-promise-native')
  , config = reqlib('lib/config/config')
  ;

var baseUrl = "http://eol.org/api";
var formatPart = "1.0.json";

var apiKey = config.get('eolApiKey');
if (!apiKey) {
  throw new TypeError("eolApiKey not configured");
}

function getJson(apiName, params, log) {
  var url = [baseUrl, "/", apiName, "/", formatPart].join('')
    , qs = Object.assign({}, params, { key: apiKey })
    ;

  return request.get({
    url: url, 
    qs: qs
  }).then((body) => {
    var parsed;

    try {
      parsed = JSON.parse(body);
    } catch (e) {
      log.debug({ body: body }, 'Unparseable response body');
      throw e;
    }

    return parsed;
  });
}
module.exports.getJson = getJson;
