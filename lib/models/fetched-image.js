/*
 * Represents an image fetched from a url. Used to prevent multiple downloads
 * of the same image.
 * XXX: this assumes that the image referred to by a url won't ever
 * change. That may or may not be a reasonable assumption in the real world.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var request = require('request');
var sharp = require('sharp');
var path = require('path');

var fileUtil = require('_/models/util/file-util');

var maxWidthHeight = 241;

var FetchedImageSchema = new Schema({
  path: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, required: true },
  format: { type: String, required: true }
});

FetchedImageSchema.statics.findOrCreate = function(url, dest, cb) {
  var that = this;

  that.findOne({ url: url }, (err, result) => {
    if (err) return cb(err);

    if (result) {
      return cb(null, result);
    }

    request({ uri: url, encoding: null}, (err, resp, body) => {
      if (err) return cb(err);

      fileUtil.randomFilename((err, filename) => {
        if (err) return cb(err);

        var fullPath = path.join(dest, filename);

        sharp(body)
          .resize(maxWidthHeight, maxWidthHeight)
          .min()
          .withoutEnlargement()
          .toFile(fullPath, (err, info) => {
            if (err) return cb(err);

            that.create({
              path: fullPath,
              url: url,
              size: info.size,
              format: info.format
            }, cb);
          });
      });
    });
  });
};

FetchedImageSchema.methods.read = function(cb) {
  fileUtil.read(this, cb);
};

module.exports = mongoose.model('FetchedImage', FetchedImageSchema);
