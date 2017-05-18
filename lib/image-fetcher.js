/*
 * Image fetcher for use with template-renderer.
 */
var request = require('request');
var sharp = require('sharp');
var Image = require('canvas').Image;
var FetchedImage = require('_/models/fetched-image');
var path = require('path');

module.exports.fetch = function(url, cb) {
  FetchedImage.findOrCreate(
    url,
    path.join(__dirname, '..', 'storage/external_images'),
    (err, image) => {
      if (err) return cb(err);

      image.read((err, buffer) => {
        if (err) return cb(err);

        var image = new Image;
        image.src = buffer;

        cb(null, image);
      });
    }
  )
};
