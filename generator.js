var Canvas = require('canvas');
var Image = Canvas.Image;
var fs = require('fs');
var request = require('request');
var dbconnect = require('./dbconnect');
var templateReader = require('./template-reader');
var templateRenderer = require('./template-renderer/template-renderer');
var canvasSupplier = require('./canvas-supplier');
var DedupFile = require('./models/dedup-file');

var ObjectID = require('mongodb').ObjectID;

var dpi = 72;

var templates = {
  'trait': 'trait'
}

templateRenderer.setTemplateSupplier(templateReader);
templateRenderer.setCanvasSupplier(canvasSupplier);

module.exports.generate = function generate(card, cb) {
  var data = JSON.parse(JSON.stringify(card.data))
    , defaults = card.defaultData
    , choices = card.choices
    , canvas = null;


  templateRenderer.loadTemplate(card.templateName, (err) => {
    if (err) return cb(err);

    resolveData(data, choices, defaults, (err, data) => {
      canvas = templateRenderer.draw(data);
      return cb(null, canvas.toBuffer());
    });
  });
}

function resolveData(data, choices, defaults, cb) {
  // populate blank fields with defaults if present
  Object.keys(defaults).forEach((key) => {
    var defaultVal = defaults[key];

    if (!data[key]) {
      data[key] = defaultVal;
    }
  });

  // resolve images
  var imageFields = templateRenderer.imageFields()
    , imageFieldNames = imageFields.map(function(field) {
        return field.id;
      });

  resolveImages(data, choices, imageFieldNames, (err, data) => {
    if (err) return cb(err);

    cb(null, data);
  });
}


function resolveImages(data, choices, imageFieldNames, cb) {
  if (imageFieldNames.length === 0) {
    return cb(null, data);
  }

  var fieldName = imageFieldNames.pop()
    , field = data[fieldName]
    , imageId = null
    , imageData = null
    , imageFile = null;

  if (!field) {
    return resolveImages(data, choices, imageFieldNames, cb);
  }

  if ('index' in field) {
    field.url = choices[fieldName][field['index']];
    imageFieldNames.push(fieldName); // Resolve url on next recursion
    delete field.index;
    return resolveImages(data, choices, imageFieldNames, cb);
  } else if ('url' in field) {
    var url = field.url;

    request({uri: url, encoding: null}, function(err, resp, body) {
      if (err) return cb(err);

      var image = new Image;
      image.src = body;
      field.image = image;

      return resolveImages(data, choices, imageFieldNames, cb);
    });
  } else {
    imageId = field.imageId;

    DedupFile.findById(imageId, (err, result) => {
      if (err) return cb(err);

      result.read((err, fileSrc) => {
        if (err) return cb(err);

        var image = new Image;
        image.src = fileSrc;
        field.image = image;

        return resolveImages(data, choices, imageFieldNames, cb);
      });
    })
  }
}
