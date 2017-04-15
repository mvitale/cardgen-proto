/*
 * Image fetcher for use with template-renderer.
 */
var request = require('request');
var sharp = require('sharp');
var Image = require('canvas').Image;

module.exports.fetch = function(url, cb) {
  request({uri: url, encoding: null}, function(err, resp, body) {
    if (err) return cb(err);

    var resized = sharp(body)
      .resize(241, 241)
      .min()
      .withoutEnlargement()
      .toBuffer(function(err, buffer) {
        if (err) return cb(err);

        var image = new Image;
        image.src = buffer;

        cb(null, image);
      });
  });
}
