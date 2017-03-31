var fs = require('fs');

var templateCache = {};
var templateDefaultsCache = {};
var templateDir = './templates';
var templateDefaultsDir = './template-defaults/data'

/*
 * Get template with a given name, either by reading the corresponding
 * json file or retrieving from cache
 */
function getTemplate(name, cb) {
  templateDataHelper(name, templateCache, templateDir, (err, templateData) => {
    if (err) return cb(err);

    return cb(null, templateData);
  });
}
module.exports.getTemplate = getTemplate;

/*
 * Lazy-load cache with json file and pass result to cb
 */
function templateDataHelper(name, cache, dir, cb) {
  if (cache[name]) {
    return cb(null, JSON.parse(JSON.stringify(cache[name]))); // TODO: I hate this, but it should make a defensive copy
  }

  fs.readFile(dir + '/' + name + '.json', (err, data) => {
    if (err) return cb(err);

    var parsed = JSON.parse(data);
    cache[name] = parsed;

    return cb(null, parsed);
  })
}

/*
 * Get default data for a template name + template params
 */
function getDefaultAndChoiceData(name, params, cb) {
  getTemplate(name, function(err, template) {
    if (err) return cb(err);

    var //apiCalls = template.apiCalls
        apiSupplier = template.apiSupplier
      , spec = template.spec;

    makeApiCalls(apiSupplier, params, {}, (err, results) => {
      if (err) return cb(err);

      var choiceSuppliers = template['choiceSuppliers'];
      return choiceHelper(Object.keys(choiceSuppliers), choiceSuppliers,
        params, results, {}, (err, choices) => {
          if (err) return cb(err);

          var defaultSuppliers = template['defaultSuppliers']

          return defaultDataHelper(Object.keys(defaultSuppliers), defaultSuppliers,
            params, results, choices, spec.fields, {}, (err, defaults) => {
              if (err) return cb(err);
              return cb(null, {'defaultData': defaults, 'choices': choices});
          })
      });
    });
  });
}
module.exports.getDefaultAndChoiceData = getDefaultAndChoiceData;


/*
 * Make EOL API calls specified in template defaults, and pass results to
 * callback in the form: {'<api name'>: <api result>, ... }
 */
function makeApiCalls(apiSupplierName, templateParams, results, cb) {
  var apiSupplier = require('./suppliers/api/' + apiSupplierName);

  apiSupplier.supply(templateParams, cb);
}
/*
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
*/

/*
 * Resolve any API params that need to be populated from template params
 * (those strings beginning with $)
 */
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

function supplierHelper(
  supplierType,
  fieldIds,
  spec,
  params,
  apiResults,
  data,
  cb) {

}

/*
 * Fill in all field defaults
 */
function defaultDataHelper(fieldIds, spec, params, apiResults, choices, fieldSpecs,
  data, cb) {
  if (fieldIds.length === 0) {
    return cb(null, data);
  }

  var fieldId = fieldIds.pop()
    , fieldSpec = fieldSpecs[fieldId]
    , supplierName = spec[fieldId]
    , supplier = require('./suppliers/default/' + supplierName);

  supplier.supply(params, apiResults, choices[fieldId], fieldSpec,
    (err, val, choiceIndex) => {
      if (err) return cb(err);

      var defaultObj = {};

      if (val != null) {
        defaultObj.value = val
      } else if (choiceIndex != null) {
        defaultObj.choiceIndex = choiceIndex
      }

      data[fieldId] = defaultObj;

      return defaultDataHelper(fieldIds, spec, params, apiResults,
        choices, fieldSpecs, data, cb);
    }
  );
}

/*
 * Fill in all field choices
 */
function choiceHelper(fieldIds, defaultSuppliers, params, apiResults, data, cb) {
  if (fieldIds.length === 0) {
    return cb(null, data);
  }

  var fieldId = fieldIds.pop()
    , supplierName = defaultSuppliers[fieldId]
    , supplier = require('./suppliers/choice/' + supplierName);

  supplier.supply(params, apiResults, (err, val) => {
    if (err) return cb(err);

    data[fieldId] = val;
    return choiceHelper(fieldIds, defaultSuppliers, params, apiResults,
      data, cb);
  });
}
