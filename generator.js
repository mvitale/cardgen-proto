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

module.exports.generate = function generate(card, callback) {
  var data = JSON.parse(JSON.stringify(card.data))
    , defaults = card.defaultData
    , choices = card.choices
    , fields = card.fields
    , canvas = null;

  templateRenderer.loadTemplate(card.templateName, (err) => {
    if (err) return callback(err);

    resolveData(data, fields, choices, defaults, (err, data) => {
      canvas = templateRenderer.draw(data);
      return callback(null, canvas.toBuffer());
    });
  });
}

function resolveData(data, fields, choices, defaults, cb) {
  // populate blank fields with defaults if present
  Object.keys(defaults).forEach((key) => {
    var defaultVal = defaults[key];

    if (!data[key]) {
      data[key] = defaultVal;
    }
  });

  // resolve images
  var imageFields = fields.filter(function(field) {
        return field['type'] === 'image';
      })
    , imageFieldNames = imageFields.map(function(field) {
        return field['id'];
      });

  resolveImages(data, choices, imageFieldNames, (err, data) => {
    if (err) return cb(err);

    cb(null, data);
  });
}


function resolveImages(data, choices, imageFieldNames, callback) {
  if (imageFieldNames.length === 0) {
    return callback(null, data);
  }

  var fieldName = imageFieldNames.pop()
    , field = data[fieldName]
    , imageId = null
    , imageData = null
    , imageFile = null;

  console.log(imageFieldNames);
  console.log(fieldName);
  console.log(data);
  console.log(field);
  console.log(choices);
  console.log('-----------------------')

  if (!field) {
    return resolveImages(data, choices, imageFieldNames, callback);
  }

  if ('index' in field) {
    field['url'] = choices[fieldName][field['index']];
    imageFieldNames.push(fieldName); // Resolve url on next recursion
    delete field['index'];
    return resolveImages(data, choices, imageFieldNames, callback);
  } else if ('url' in field) {
    var url = field['url'];

    request({uri: url, encoding: null}, function(err, resp, body) {
      if (err) throw err;

      var image = new Image;
      image.src = body;
      field['image'] = image;

      return resolveImages(data, choices, imageFieldNames, callback);
    });
  } else {
    imageId = field['imageId'];

    DedupFile.findById(imageId, (err, result) => {
      if (err) return callback(err, null);

      fs.readFile(__dirname + '/' + result.path, function(err, fileSrc) {
        if (err) return callback(err, null);

        var image = new Image;
        image.src = fileSrc;
        field['image'] = image;

        return resolveImages(data, choices, imageFieldNames, callback);
      });
    })
  }
}
