var request = require('request');

var Image = require('canvas').Image;

module.exports.fetch = function(url, cb) {
  request({uri: url, encoding: null}, function(err, resp, body) {
    if (err) return cb(err);

    var image = new Image;
    image.src = body;

    return cb(null, image);
  });
}
