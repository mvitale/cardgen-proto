/*
 * Utility class that supplies template data and can fetch default data
 * for a template and its parameters.
 */

var fs = require('fs')
  , path = require('path')
  , config = require('_/config/config')
  ;

var defaultTemplateLoader = require('_/template-loader')
  , i18n = require('_/i18n')
  , fieldLabelPrefix = 'template.fieldLabels.'
  , defaultLocale
  ;

var defaultSupplierLoader = {
  load: function(name, type) {
    return require('_/suppliers/' + type + '/' + name);
  }
};

var templateCache = {}
  , supplierLoader = defaultSupplierLoader
  , templateLoader = defaultTemplateLoader
  , templateDir = './templates'
  ;

var defaultTemplateDir = path.join(__dirname, 'templates');

function load() {
  var templates = templateLoader.templates()
    , locales = config.get('i18n.availableLocales')
    , template
    ;

  defaultLocale = config.get('i18n.defaultLocale');

  if (!locales || !locales.length) {
    throw new Error('No locales enabled (i18n.availableLocales)');
  }

  if (!defaultLocale) {
    throw new Error('Default locale not set (i18n.defaultLocale)');
  }

  templates.forEach((origTemplate) => {
    locales.forEach((locale) => {
      template = translateTemplate(locale, origTemplate);

      // Do this here rather than outside side choices will ultimately be localized
      populateTemplateChoices(template, locale, (err) => {
        if (err) throw err;
        templateCache[cacheKey(template.name, locale)] = template;
      });
    });
  });
}
module.exports.load = load;

function translateTemplate(locale, template) {
  var templateCopy = JSON.parse(JSON.stringify(template))
    , field
    ;

  Object.keys(templateCopy.spec.fields).forEach((key) => {
    field = templateCopy.spec.fields[key];

    if ('labelKey' in field) {
      field.label = i18n.t(locale, fieldLabelPrefix + field.labelKey);
      delete field.labelKey;
    }
  });

  return templateCopy;
}

function cacheKey(templateName, locale) {
  return templateName + '_' + locale;
}

function populateTemplateChoices(template, locale, cb) {
  if (!template.templateChoiceSuppliers) {
    return cb();
  }

  choiceHelper(
    Object.keys(template.templateChoiceSuppliers),
    template.templateChoiceSuppliers,
    {},
    {},
    {},
    {},
    locale,
    (err, data, tips) => {
      if (err) return cb(err);

      template.choices = data;
      template.choiceTips = tips;
      cb();
    }
  );
}

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
 *   locale -
 *   name - valid template name
 *
 * Returns:
 *   the template if found, or null if not
 */
function getTemplate(name, locale) {
  if (!locale) {
    throw new TypeError('locale undefined or null');
  }

  var key = cacheKey(name, locale);

  if (key in templateCache) {
    return templateCache[key];
  } else if (locale !== defaultLocale) {
    return getTemplate(name, defaultLocale);
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
function getDefaultAndChoiceData(name, locale, params, cb) {
  var template = getTemplate(name, locale)
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
      locale,
      (err, choices, tips) => {
        if (err) return cb(err);

        var defaultSuppliers = template.defaultSuppliers;

        return defaultDataHelper(
          Object.keys(defaultSuppliers),
          defaultSuppliers,
          params,
          results,
          Object.assign({}, choices, template.choices),
          Object.assign({}, tips, template.choiceTips),
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
  tips,
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
    return cb(e);
  }

  supplier.supply(params, apiResults, choices[fieldId], tips[fieldId],
    (err, val, choiceKey) => {
      if (err) return cb(err);

      var defaultObj = {};

      if (val != null) {
        defaultObj.value = val
      }

      if (choiceKey != null) {
        defaultObj.choiceKey = choiceKey
      }

      data[fieldId] = defaultObj;

      return defaultDataHelper(fieldIds, defaultSuppliers, params, apiResults,
        choices, tips, data, cb);
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
function choiceHelper(
  fieldIds,
  choiceSuppliers,
  params,
  apiResults,
  data,
  tips,
  locale,
  cb
) {
  if (fieldIds.length === 0) {
    return cb(null, data, tips);
  }

  var fieldId = fieldIds.pop()
    , supplierName = choiceSuppliers[fieldId]
    , supplier = null
    , fieldTips
    ;

  try {
    supplier = supplierLoader.load(supplierName, 'choice');
  } catch (e) {
    return cb(e);
  }

  supplier.supply(params, apiResults, (err, val, fieldTipKeys) => {
    if (err) return cb(err);

    data[fieldId] = val;

    if (fieldTipKeys) {
      fieldTips = new Array(fieldTipKeys.length);
      fieldTipKeys.forEach((key, i) => {
        if (key) {
          fieldTips[i] = i18n.t(locale, key);
        } else {
          fieldTips[i] = null;
        }
      });
      tips[fieldId] = fieldTips;
    }

    return choiceHelper(fieldIds, choiceSuppliers, params, apiResults,
      data, tips, locale, cb);
  });
}
