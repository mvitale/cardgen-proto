var Canvas = require('canvas');
var Image = Canvas.Image;
var fs = require('fs');
var request = require('request');
var dbconnect = require('./dbconnect');
var ObjectID = require('mongodb').ObjectID;

var dpi = 72;

var templates = {
  'trait': 'trait'
}

function generate(options, callback) {
  console.log(options);

  var template = require('./templates/' + templates[options['template']]),
      content = options['content'],
      canvasWidth = template.width(),
      canvasHeight = template.height(),
      imageFieldNames = template.imageFieldNames(),
      canvas = new Canvas(canvasWidth, canvasHeight, 'svg');

  resolveImages(content, imageFieldNames, function(err, content) {
    if (err) return callback(err, null);

    template.draw(canvas, content);
    return callback(null, canvas.toBuffer());
  });
}

function resolveImages(content, imageFieldNames, callback) {
  if (imageFieldNames.length === 0) {
    return callback(null, content);
  }

  dbconnect.getCardsConn(function(err, db) {
    if (err) return callback(err, null);

    var field = null
      , imageId = null
      , imageData = null
      , imageFile = null;


    field = content[imageFieldNames.pop()];

    if (field['url']) {
      var url = field['url'];
      console.log(url)

      request({uri: url, encoding: null}, function(err, resp, body) {
        if (err) throw err;

        var image = new Image;
        image.src = body;
        field['image'] = image;

        return resolveImages(content, imageFieldNames, callback);
      });
    } else {
      imageId = field['imageId'];

      imageData = db.collection('images').findOne({
        '_id': ObjectID(imageId)
      }, function(err, result) {
        if (err) return callback(err, null);

        fs.readFile(__dirname + '/storage/images/' + result['filename'], function(err, fileSrc) {
          if (err) return callback(err, null);

          var image = new Image;
          image.src = fileSrc;
          field['image'] = image;

          return resolveImages(content, imageFieldNames, callback);
        });
      });
    }
  });
}

module.exports.generate = generate;
