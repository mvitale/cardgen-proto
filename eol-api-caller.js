var request = require('request');
var parseXmlString = require("xml2js").parseString
var baseUrl = "http://eol.org/api";

function getJson(apiName, params, cb) {
  var url = baseUrl + "/" + apiName;

  request({url: url, qs: params}, (err, res, body) => {
    if (err) return cb(err);

    parseXmlString(body, (err, result) => {
      if (err) return cb(err);

      return cb(null, result);
    });
  });
}
module.exports.getJson = getJson;
