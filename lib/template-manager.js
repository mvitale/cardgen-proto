var reqlib = require('app-root-path').require;
/*
 * Utility class that supplies template data and can fetch default data
 * for a template and its parameters.
 */

var fs = require('fs')
  , path = require('path')
  , config = reqlib('lib/config/config')
  ;

var defaultTemplateLoader = reqlib('lib/template-loader')
  , i18n = reqlib('lib/i18n')
  , fieldLabelPrefix = 'template.fieldLabels.'
  , fieldCtaPrefix = 'template.fieldCtas.'
  , defaultLocale
  , loaded = false
  ;

var defaultSupplierLoader = {
  load: function(name, type) {
    return reqlib('lib/suppliers/' + type + '/' + name);
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
      populateTemplateValues(template, locale);
      // Do this here rather than outside side choices will ultimately be localized
      populateTemplateChoices(template, locale, (err) => {
        if (err) throw err;

        if (!templateCache[template.name]) {
          templateCache[template.name] = {};
        }
        if (!templateCache[template.name][template.version]) {
          templateCache[template.name][template.version] = {}; 
        }

        templateCache[template.name][template.version][locale] = template;
      });
    });
  });

  loaded = true;
}
module.exports.load = load;

function translateTemplate(locale, template) {
  var templateCopy = JSON.parse(JSON.stringify(template))
    , field
    ;

  Object.keys(templateCopy.spec.fields).forEach((key) => {
    field = templateCopy.spec.fields[key];

    if ('uiLabelKey' in field) {
      field.uiLabel = i18n.t(locale, fieldLabelPrefix + field.uiLabelKey);
      delete field.uiLabelKey;
    } 

    if ('ctaKey' in field) {
      field.cta = i18n.t(locale, fieldCtaPrefix + field.ctaKey);
    }
  });

  return templateCopy;
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

function populateTemplateValues(template, locale) {
  if (!template.templateValueSuppliers) {
    return;
  }

  Object.keys(template.templateValueSuppliers).forEach((fieldId) => {
    var supplier = 
      supplierLoader.load(template.templateValueSuppliers[fieldId], 'value');
    console.log(template);
    template.spec.fields[fieldId].value = supplier.supply(locale);
  });
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
function getTemplate(name, version, locale) {
  var locales
    , versions
    , template
    ;

  if (!loaded) {
    throw new TypeError('template-manager not loaded');
  }

  if (!locale) {
    throw new TypeError('locale undefined or null');
  }

  if (!version) {
    throw new TypeError('version undefined or null');
  }

  versions = templateCache[name];

  if (!versions) {
    return null;
  }

  locales = versions[version];
  template = locales[locale];

  if (!template && locale !== defaultLocale) {
    return getTemplate(name, version, defaultLocale);
  }

  return template;
}
module.exports.getTemplate = getTemplate;

// Throw TypeError if templateName missing or invalid
module.exports.maxTemplateVersion = function(templateName, app) {
  var version = config.get('appTemplateVersions.' + app + '.' + templateName);
   
  if (!version) {
    throw new TypeError('Version not configured for app ' + app + ' and template ' + templateName);
  }

  return version;
}

/*
 * Get Card defaults and choices data for a template name + template params.
 *
 * Parameters:
 *   name - a valid template name (see templates directory)
 *   version - a valid template version or null. If null, 
 *      the highest template version is chosen.
 *   params - an Object containing the parameters for the template
 *     (e.g., { speciesId: 1234 })
 *   cb - callback
 *
 * Result:
 *   { defaultData: <defaults>, choices: <choices> }
 */
function getDefaultAndChoiceData(name, version, locale, params, log, cb) {
  var template = getTemplate(name, version, locale)
    , apiSupplier = null
    , spec = null
    ;

  if (!template) {
    return cb(new Error('Template ' + name + ' not found'));
  }

  dataSupplier = template.dataSupplier;
  spec = template.spec;

  /*
   * Make external API calls, then get defaults and choices
   */
  fetchData(dataSupplier, params, log, locale, (err, results) => {
    if (err) return cb(err);

    var choiceSuppliers = template.choiceSuppliers || {};

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

        var defaultSuppliers = template.defaultSuppliers || {};

        return defaultDataHelper(
          Object.keys(defaultSuppliers),
          defaultSuppliers,
          params,
          results,
          Object.assign({}, choices, template.choices),
          Object.assign({}, tips, template.choiceTips),
          {},
          locale,
          (err, defaults) => {
            if (err) return cb(err);
            return cb(null, {defaultData: defaults, choices: choices, choiceTips: tips});
        });
    });
  });
}
module.exports.getDefaultAndChoiceData = getDefaultAndChoiceData;


/*
 * Load the data supplier with a given name and call it with the provided
 * parameters.
 *
 * Parameters:
 *   dataSupplierName - the name of a data supplier module
 *      (see suppliers/data directory)
 *   templateParams - template parameters Object
 *   cb - function(err, result)
 *
 * Result:
 *   The result of calling the supplier's supply method
 */
function fetchData(dataSupplierName, templateParams, log, locale, cb) {
  var dataSupplier = null;

  if (dataSupplierName) {
    try {
      dataSupplier = supplierLoader.load(dataSupplierName, 'data');
    } catch (e) {
      return cb(e);
    }

    dataSupplier.supply(templateParams, log, locale, cb);
  } else {
    return cb(null, {});
  }
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
 *   data - Results returned from calling fetchData
 *   choices - field choices from calling choiceHelper
 *   defaults - Object to hold results
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
  data,
  choices,
  tips,
  defaults,
  locale,
  cb
) {
  if (fieldIds.length === 0) {
    return cb(null, defaults);
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

  supplier.supply(params, data, choices[fieldId], tips[fieldId], locale,
    (err, val, choiceKey) => {
      if (err) return cb(err);

      var defaultObj = {};

      if (val != null) {
        defaultObj.value = val
      }

      if (choiceKey != null) {
        defaultObj.choiceKey = choiceKey
      }

      defaults[fieldId] = defaultObj;

      return defaultDataHelper(fieldIds, defaultSuppliers, params, data,
        choices, tips, defaults, locale, cb);
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
 *   data - Results returned from calling fetchData
 *   choices - Object to hold results
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
  data,
  choices,
  tips,
  locale,
  cb
) {
  if (fieldIds.length === 0) {
    return cb(null, choices, tips);
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

  supplier.supply(params, data, locale, (err, val, fieldTips) => {
    if (err) return cb(err);

    choices[fieldId] = val;

    if (fieldTips) {
      tips[fieldId] = fieldTips;
    }

    return choiceHelper(fieldIds, choiceSuppliers, params, data,
      choices, tips, locale, cb);
  });
}
