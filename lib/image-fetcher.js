var reqlib = require('app-root-path').reqlib;
/*
 * Image fetcher for use with template-renderer.
 */
var request = require('request')
  , sharp = require('sharp')
  , canvas = require('canvas')
  , FetchedImage = require('_/models/fetched-image')
  , path = require('path')
  ;

var storageDir = path.join(__dirname, '..', 'storage/external_images'); // TODO: ugly
module.exports.storageDir = storageDir;

module.exports.fetch = function(url, cb) {
  FetchedImage.findOrCreate(
    url,
    storageDir,
    (err, fetchedImage) => {
      if (err) return cb(err);

      fetchedImage.read((err, buffer) => {
        if (err) return cb(err);

        var image = new canvas.Image;
        image.src = buffer;

        cb(null, image);
      });
    }
  )
};
