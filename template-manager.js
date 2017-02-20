var fs = require('fs');

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

    return defaultDataHelper(Object.keys(defaultSpec), defaultSpec, params,
      {}, cb);
  });
}
module.exports.getDefaultData = getDefaultData;

function defaultDataHelper(fieldIds, spec, params, data, cb) {
  if (fieldIds.length === 0) {
    return cb(null, data);
  }

  var fieldId = fieldIds.pop()
    , defaultSupplierName = spec[fieldId]
    , defaultSupplier = require('./template-defaults/suppliers/' +
        defaultSupplierName);

  defaultSupplier.supply(params, function(err, val) {
    if (err) return cb(err);

    data[fieldId] = val;
    return defaultDataHelper(fieldIds, spec, params, data, cb);
  });
}
