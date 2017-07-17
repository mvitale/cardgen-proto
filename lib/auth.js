var fs = require('fs');
var config = require('_/config/config');

var keysToAppNames;

function setKeysToAppNames(obj) {
  var val;

  keysToAppNames = {};

  for (appName in obj) {
    apiKey = obj[appName];
    keysToAppNames[apiKey] = appName;
    console.log('Loaded api key for ' + appName);
  }
}

module.exports.init = function() {
  var rawData = fs.readFileSync(__dirname + '/config/api-keys.json')
    , data = JSON.parse(rawData)
    ;

  if (!Object.keys(data).length) {
    throw new Error('No client apps configured in config/api-keys.js');
  }

  setKeysToAppNames(data);
}

module.exports.auth = function(apiKey) {
  if (apiKey in keysToAppNames) {
    return keysToAppNames[apiKey];
  } else {
    return null;
  }
}
