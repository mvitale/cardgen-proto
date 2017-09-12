var fs = require('fs');
var config = require('_/config/config');

var defaultApiKeySupplier = () => {
  var rawData = fs.readFileSync(__dirname + '/config/api-keys.json')
    , data = JSON.parse(rawData)
    ;

  return data;
};

var keysToAppNames
  , apiKeySupplier = defaultApiKeySupplier
  ;

function setKeysToAppNames(obj) {
  var val;

  keysToAppNames = {};

  for (appName in obj) {
    apiKey = obj[appName];
    keysToAppNames[apiKey] = appName;
    console.log('Loaded api key for ' + appName);
  }
}

// For unit tests
module.exports.setApiKeySupplier = function(supplier) {
  apiKeySupplier = supplier;
}

module.exports.init = function() {
  var apiKeys = apiKeySupplier();

  if (!apiKeys || !Object.keys(apiKeys).length) {
    throw new Error('No api keys configured');
  }

  setKeysToAppNames(apiKeys);
}

module.exports.auth = function(apiKey) {
  if (apiKey in keysToAppNames) {
    return keysToAppNames[apiKey];
  } else {
    return null;
  }
}
