var reqlib = require('app-root-path').require;
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

var fileUtil = reqlib('lib/models/util/file-util');

var hiResMaxWidthHeight = 2 * 3.74 * 300
  , loResMaxWidthHeight = 200
  ;

var FetchedImageSchema = new Schema({
  origPath: { type: String, required: true },
  origSize: { type: Number, required: true },
  hiResPath: { type: String, required: true },
  hiResSize: { type: Number, required: true },
  loResPath: { type: String, required: true },
  loResSize: { type: Number, required: true },
  url: { type: String, required: true },
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

      if (resp.statusCode !== 200) {
        return cb(new Error(
          'Failed to fetch image from ' + url + '. Status: ' + resp.statusCode
        ));
      }

      fileUtil.randomFilename((err, filename) => {
        if (err) return cb(err);

        var origPath = path.join(dest, filename + '_orig')
          , hiPath = path.join(dest, filename + '_hi')
          , loPath = path.join(dest, filename + '_lo')
          , origSize
          , hiResSize
          ;

        saveFile(body, null, origPath)
          .then((info) => {
            origSize = info.size; 
            return saveFile(body, hiResMaxWidthHeight, hiPath)
          })
          .then((info) => {
            hiResSize = info.size;
            return saveFile(body, loResMaxWidthHeight, loPath) 
          })
          .then((info) => {
            that.create({
              origPath: origPath,
              origSize: origSize,
              hiResPath: hiPath,
              hiResSize: hiResSize,
              loResPath: loPath,
              loResSize: info.size,
              url: url,
              format: info.format
            }, cb)
          })
          .catch((e) => {
            return cb(e);
          });
      });
    });
  });
};

function saveFile(data, maxWidthHeight, path) {
  return sharp(data)
    .resize(maxWidthHeight, maxWidthHeight)
    .min()
    .withoutEnlargement()
    .toFile(path);
}

FetchedImageSchema.methods.readHiRes = function(cb) {
  fileUtil.read(this.hiResPath, cb);
};

FetchedImageSchema.methods.readLoRes = function(cb) {
  fileUtil.read(this.loResPath, cb);
}

module.exports = mongoose.model('FetchedImage', FetchedImageSchema);
