var fs = require('fs');
var eolApiCaller = require('./eol-api-caller');

var templateCache = {};
var templateDefaultsCache = {};
var templateDir = './templates';
var templateDefaultsDir = './template-defaults/data'

function getTemplate(name, cb) {
  return templateDataHelper(name, templateCache, templateDir, cb);
}
module.exports.getTemplate = getTemplate;

function getTemplateDefaults(name, cb) {
  return templateDataHelper(name, templateDefaultsCache, templateDefaultsDir,
    cb);
}

function templateDataHelper(name, cache, dir, cb) {
  if (cache[name]) {
    return cb(null, cache[name]);
  }

  fs.readFile(dir + '/' + name + '.json', (err, data) => {
    if (err) return cb(err);

    var parsed = JSON.parse(data);
    cache[name] = parsed;

    return cb(null, parsed);
  })
}

function getDefaultData(name, params, cb) {
  getTemplateDefaults(name, function(err, defaultSpec) {
    if (err) return cb(err);

    var apiCalls = defaultSpec['eolApiCalls'];

    makeApiCalls(apiCalls, params, {}, (err, results) => {
      var defaultSuppliers = defaultSpec['defaultSuppliers'];

      return defaultDataHelper(Object.keys(defaultSuppliers), defaultSuppliers,
      params, results, {}, cb);
    });
  });
}
module.exports.getDefaultData = getDefaultData;

function makeApiCalls(apiCalls, templateParams, results, cb) {
  if (!apiCalls || apiCalls.length === 0) {
    return cb(null, results);
  }

  var apiCall = apiCalls.pop()
    , apiName = apiCall['api']
    , apiParams = apiCall['params'];

  resolveApiParams(apiParams, templateParams);

  eolApiCaller.getJson(apiName, apiParams, (err, jsonResult) => {
    if (err) return cb(err);

    results[apiName] = jsonResult;
    return makeApiCalls(apiCalls, templateParams, results, cb);
  })
}

function resolveApiParams(apiParams, templateParams) {
  Object.keys(apiParams).forEach((key) => {
    var val = apiParams[key]
      , templateParamsKey = null;

    if (typeof val === "string" && val.startsWith('$')) {
      templateParamsKey = val.substr(1);
      apiParams[key] = templateParams[templateParamsKey];
    }
  });
}

function defaultDataHelper(fieldIds, spec, params, apiResults, data, cb) {
  if (fieldIds.length === 0) {
    return cb(null, data);
  }

  var fieldId = fieldIds.pop()
    , defaultSupplierName = spec[fieldId]
    , defaultSupplier = require('./template-defaults/suppliers/' +
        defaultSupplierName);

  defaultSupplier.supply(params, apiResults, function(err, val) {
    if (err) return cb(err);

    data[fieldId] = val;
    return defaultDataHelper(fieldIds, spec, params, apiResults, data, cb);
  });
}
