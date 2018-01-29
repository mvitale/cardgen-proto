var reqlib = require('app-root-path').require
  , request = require('request')
  , config = reqlib('lib/config/config')
  , requestRate = 2000
  , queueCheckRate = 1
  ;

var baseUrl = "http://eol.org/api";
var formatPart = "1.0.json";

var requestQueue = []
  , maxJobs = 100
  ;

var apiKey = config.get('eolApiKey');
if (!apiKey) {
  throw new TypeError("eolApiKey not configured");
}

function getJson(apiName, params, log, cb) {
  if (requestQueue.length < maxJobs) {
    console.log('add request to queue');
    requestQueue.unshift({
      apiName: apiName,
      params: params,
      log: log,
      cb: cb
    });
  } else {
    cb(new TypeError('maxJobs reached'));
  }
}
module.exports.getJson = getJson;

function nextRequest() {
  console.log('checking for requests. queue size: ' + requestQueue.length);
  if (requestQueue.length) {
    var req = requestQueue.pop();
    var url = [baseUrl, "/", req.apiName, "/", formatPart].join('')
      , qs = Object.assign({}, req.params, { key: apiKey })
      ;
    console.log('get ' + url);

    request.get({
      url: url, 
      qs: qs
    }, (err, res, body) => {
      console.log('finished a request');
      var parsed;

      if (err) {
        req.cb(err);
      } else {
        try {
          parsed = JSON.parse(body);
          req.cb(null, parsed);
        } catch (e) {
          req.log.debug({ body: body }, 'Unparseable response body');
          console.log('body: ', body);
          req.cb(e);
        }
      }

      setTimeout(nextRequest, requestRate);
    });
  } else {
    setTimeout(nextRequest, requestRate);
  }
}

nextRequest();
