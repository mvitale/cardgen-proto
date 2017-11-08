var reqlib = require('app-root-path').require;
var request = require('request');
var baseUrl = "http://eol.org/api";
var formatPart = "1.0.json"

function getJson(apiName, params, cb) {
  var url = [baseUrl, "/", apiName, "/", formatPart].join('');

  request.get({url: url, qs: params}, (err, res, body) => {
    if (err) return cb(err);

    return cb(null, JSON.parse(body));
  });
}
module.exports.getJson = getJson;
