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

module.exports.generate = function generate(options, callback) {
  var content = options['content']
    , imageFields = null
    , imageFieldNames = null
    , canvas = null;

  templateRenderer.loadTemplate(options['template'], (err) => {
    if (err) return callback(err);

    imageFields = templateRenderer.imageFields();
    imageFieldNames = imageFields.map(function(field) {
      return field['id'];
    });

    resolveImages(content, imageFieldNames, function(err, content) {
      if (err) return callback(err);

      canvas = templateRenderer.draw(content);
      return callback(null, canvas.toBuffer());
    });
  });
}

function resolveImages(content, imageFieldNames, callback) {
  if (imageFieldNames.length === 0) {
    return callback(null, content);
  }

  var field = null
    , imageId = null
    , imageData = null
    , imageFile = null;

  field = content[imageFieldNames.pop()];

  if (field['url']) {
    var url = field['url'];

    request({uri: url, encoding: null}, function(err, resp, body) {
      if (err) throw err;

      var image = new Image;
      image.src = body;
      field['image'] = image;

      return resolveImages(content, imageFieldNames, callback);
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

        return resolveImages(content, imageFieldNames, callback);
      });
    })
  }
}
