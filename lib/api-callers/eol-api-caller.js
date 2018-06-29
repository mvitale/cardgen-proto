var reqlib = require('app-root-path').require
  , request = require('request')
  , config = reqlib('lib/config/config')
  ;

var baseUrl = "http://eol.org/api";
var formatPart = "1.0.json";

var apiKey = config.get('eolApiKey');
if (!apiKey) {
  throw new TypeError("eolApiKey not configured");
}

function getJson(apiName, params, log, cb) {
  var url = [baseUrl, "/", apiName, "/", formatPart].join('')
    , qs = Object.assign({}, params, { key: apiKey })
    ;

  request.get({
    url: url, 
    qs: qs
  }, (err, res, body) => {
    var parsed;

    if (err) return cb(err);

    try {
      parsed = JSON.parse(body);
    } catch (e) {
      log.debug({ body: body }, 'Unparseable response body');
      return cb(e);
    }

    cb(null, parsed);
  });
}
module.exports.getJson = getJson;
