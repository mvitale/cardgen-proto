/*
 * Utility class that supplies template data and can fetch default data
 * for a template and its parameters.
 */

var fs = require('fs');
var path = require('path');

var defaultTemplateLoader = require('_/template-loader');

var defaultSupplierLoader = {
  load: function(name, type) {
    return require('_/suppliers/' + type + '/' + name);
  }
};

var templateCache = {};
var supplierLoader = defaultSupplierLoader;
var templateLoader = defaultTemplateLoader;
var templateDir = './templates';

var defaultTemplateDir = path.join(__dirname, 'templates');

function load() {
  var templates = templateLoader.templates();

  templates.forEach((template) => {
    templateCache[template.name] = template;
  });
}
module.exports.load = load;

/*
 * For ease of unit testing
 */
function setTemplateLoader(theTemplateLoader) {
  if (!theTemplateLoader) {
    templateLoader = defaultTemplateLoader;
  } else {
    templateLoader = theTemplateLoader;
  }
}
module.exports.setTemplateLoader = setTemplateLoader;

function setSupplierLoader(theSupplierLoader) {
  if (!theSupplierLoader) {
    supplierLoader = defaultSupplierLoader;
  } else {
    supplierLoader = theSupplierLoader;
  }
}
module.exports.setSupplierLoader = setSupplierLoader;

/*
 * Get template with a given name, either by reading the corresponding
 * json file or retrieving from cache.
 *
 * Parameters:
 *   name - valid template name
 *
 * Returns:
 *   the template if found, or null if not
 */
function getTemplate(name) {
  if (name in templateCache) {
    return templateCache[name];
  } else {
    return null;
  }
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
  var template = getTemplate(name)
    , apiSupplier = null
    , spec = null
    ;

  if (!template) {
    return cb(new Error('Template ' + name + ' not found'));
  }

  apiSupplier = template.apiSupplier;
  spec = template.spec;

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
      {},
      (err, choices, tips) => {
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
            return cb(null, {defaultData: defaults, choices: choices, choiceTips: tips});
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
    apiSupplier = supplierLoader.load(apiSupplierName, 'api');
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
    , supplierName = defaultSuppliers[fieldId]
    , supplier = null
    ;

  try {
    supplier = supplierLoader.load(supplierName, 'default');
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
 *   tips - Object to hold tips
 *   cb - function(err, result)
 *
 * Result:
 *   data parameter populated where the keys are the values in fieldIds and
 *   the values are the results of calling each field id's choice supplier
 *   (specified in choiceSuppliers)
 */
function choiceHelper(fieldIds, choiceSuppliers, params, apiResults, data, tips, cb) {
  if (fieldIds.length === 0) {
    return cb(null, data, tips);
  }

  var fieldId = fieldIds.pop()
    , supplierName = choiceSuppliers[fieldId]
    , supplier = null
    ;

  try {
    supplier = supplierLoader.load(supplierName, 'choice');
  } catch (e) {
    return cb(e);
  }

  supplier.supply(params, apiResults, (err, val, fieldTips) => {
    if (err) return cb(err);

    data[fieldId] = val;

    if (fieldTips) {
      tips[fieldId] = fieldTips;
    }

    return choiceHelper(fieldIds, choiceSuppliers, params, apiResults,
      data, tips, cb);
  });
}
