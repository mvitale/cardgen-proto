var request = require('request');
//var parseXmlString = require("xml2js").parseString
var baseUrl = "http://eol.org/api";
var formatPart = "1.0.json"

function getJson(apiName, params, cb) {
  var url = [baseUrl, "/", apiName, "/", formatPart].join('');

  request({url: url, qs: params}, (err, res, body) => {
    if (err) return cb(err);

    return cb(null, JSON.parse(body));

    /*
    parseXmlString(body, (err, result) => {
      if (err) return cb(err);
      console.log(JSON.stringify(result, null, 2));
      return cb(null, result);
    });
    */
  });
}
module.exports.getJson = getJson;
