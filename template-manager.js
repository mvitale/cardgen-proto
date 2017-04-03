/*
 * Utility class that supplies template data and can fetch default data
 * for a template and its parameters.
 */

var fs = require('fs');

var templateCache = {};
var templateDefaultsCache = {};
var templateDir = './templates';
var templateDefaultsDir = './template-defaults/data'

/*
 * Get template with a given name, either by reading the corresponding
 * json file or retrieving from cache.
 *
 * Parameteres:
 *   name - valid template name
 *   cb - standard callback (err, result)
 *
 * Result:
 *   A copy of the result of calling JSON.parse on the template file
 */
function getTemplate(name, cb) {
  if (!name) {
    return cb(new Error('name required'));
  }

  if (templateCache[name]) {
    // make a defensive copy and return it
    return cb(null, JSON.parse(JSON.stringify(cache[name])));
  }

  fs.readFile(templateDir + '/' + name + '.json', (err, data) => {
    if (err) return cb(err);

    var parsed = null;

    try {
      parsed = JSON.parse(data);
    } catch (e) {
      return cb(e);
    }

    cache[name] = parsed;
    return cb(null, JSON.parse(JSON.stringify(parsed));
  });
}
module.exports.getTemplate = getTemplate;

/*
 * Get Card defaults and choices data for a template name + template params.
 *
 * Parameters:
 *   name - a valid template name (see templates directory)
 *   params - an Object containing the parameters for the template
 *     (e.g., { speciesId: 1234 })
 *   cb - callback
 *
 * Result:
 *   { defaultData: <defaults>, choices: <choices> }
 */
function getDefaultAndChoiceData(name, params, cb) {
  getTemplate(name, function(err, template) {
    if (err) return cb(err);

    var apiSupplier = template.apiSupplier
      , spec = template.spec
      ;

    /*
     * Make external API calls, then get defaults and choices
     */
    makeApiCalls(apiSupplier, params, (err, results) => {
      if (err) return cb(err);

      var choiceSuppliers = template.choiceSuppliers;

      return choiceHelper(
        Object.keys(choiceSuppliers),
        choiceSuppliers,
        params,
        results,
        {},
        (err, choices) => {
          if (err) return cb(err);

          var defaultSuppliers = template.defaultSuppliers;

          return defaultDataHelper(
            Object.keys(defaultSuppliers),
            defaultSuppliers,
            params,
            results,
            choices,
            {},
            (err, defaults) => {
              if (err) return cb(err);
              return cb(null, {'defaultData': defaults, 'choices': choices});
          });
      });
    });
  });
}
module.exports.getDefaultAndChoiceData = getDefaultAndChoiceData;


/*
 * Load the API supplier with a given name and call it with the provided
 * parameters.
 *
 * Parameters:
 *   apiSupplierName - the name of an api supplier module
 *      (see suppliers/api directory)
 *   templateParams - template parameters Object
 *   cb - function(err, result)
 *
 * Result:
 *   The result of calling the supplier's supply method
 */
function makeApiCalls(apiSupplierName, templateParams, cb) {
  var apiSupplier = null;

  try {
    apiSupplier = require('./suppliers/api/' + apiSupplierName);
  } catch (e) {
    return cb(e);
  }

  apiSupplier.supply(templateParams, cb);
}

/*
 * Fill in field defaults
 *
 * Parameters:
 *   fieldIds - Array of ids of fields to populate default data for. Each value
 *     must be present in the defaultSuppliers Object. This Array is modified by
 *     this function!
 *   defaultSuppliers - Object mapping field ids to choice suppliers.
 *   params - template parameters
 *   apiResults - Results returned from calling makeApiCalls
 *   choices - field choices from calling choiceHelper
 *   data - Object to hold results
 *   cb - function(err, result)
 *
 * Result:
 *   data parameter populated where the keys are the values in fieldIds and
 *   the values are the results of calling each field id's default supplier
 *   (specified in defaultSuppliers)
 */
function defaultDataHelper(
  fieldIds,
  defaultSuppliers,
  params,
  apiResults,
  choices,
  data,
  cb
) {
  if (fieldIds.length === 0) {
    return cb(null, data);
  }

  var fieldId = fieldIds.pop()
    , fieldSpec = fieldSpecs[fieldId]
    , supplierName = defaultSuppliers[fieldId]
    , supplier = null
    ;

  try {
    supplier = require('./suppliers/default/' + supplierName);
  } catch (e) {
    cb(e);
  }

  supplier.supply(params, apiResults, choices[fieldId],
    (err, val, choiceIndex) => {
      if (err) return cb(err);

      var defaultObj = {};

      if (val != null) {
        defaultObj.value = val
      }

      if (choiceIndex != null) {
        defaultObj.choiceIndex = choiceIndex
      }

      data[fieldId] = defaultObj;

      return defaultDataHelper(fieldIds, defaultSuppliers, params, apiResults,
        choices, data, cb);
    }
  );
}

/*
 * Fill in all field choices
 *
 * Parameters:
 *   fieldIds - Array of ids of fields to populate choice data for. Each value
 *     must be present in the choiceSuppliers Object. This Array is modified by
 *     this function!
 *   choiceSuppliers - Object mapping field ids to choice suppliers.
 *   params - template parameters
 *   apiResults - Results returned from calling makeApiCalls
 *   data - Object to hold results
 *   cb - function(err, result)
 *
 * Result:
 *   data parameter populated where the keys are the values in fieldIds and
 *   the values are the results of calling each field id's choice supplier
 *   (specified in choiceSuppliers)
 */
function choiceHelper(fieldIds, choiceSuppliers, params, apiResults, data, cb) {
  if (fieldIds.length === 0) {
    return cb(null, data);
  }

  var fieldId = fieldIds.pop()
    , supplierName = choiceSuppliers[fieldId]
    , supplier = null
    ;

  try {
    supplier = require('./suppliers/choice/' + supplierName);
  } catch (e) {
    return cb(e);
  }

  supplier.supply(params, apiResults, (err, val) => {
    if (err) return cb(err);

    data[fieldId] = val;
    return choiceHelper(fieldIds, choiceSuppliers, params, apiResults,
      data, cb);
  });
}
