var reqlib = require('app-root-path').require;
/*
 * Image fetcher for use with template-renderer.
 */
var request = require('request')
  , canvas = require('canvas')
  , FetchedImage = reqlib('lib/models/fetched-image')
  , path = require('path')
  ;

var storageDir = path.join(__dirname, '..', 'storage/external_images'); // TODO: ugly
module.exports.storageDir = storageDir;

function fetch(url, readFn, cb) {
  FetchedImage.findOrCreate(url, storageDir, (err, model) => {
    if (err) return cb(err);

    model[readFn].call(model, (err, buffer) => {
      if (err) return cb(err);

      var image = new canvas.Image;
      image.src = buffer;
      cb(null, image);
    });
  });
}

function fetchHiRes(url, cb) {
  fetch(url, 'readHiRes', cb);
};

function fetchLoRes(url, cb) {
  fetch(url, 'readLoRes', cb);
}

module.exports.hiRes = {
  fetch: fetchHiRes
};

module.exports.loRes = {
  fetch: fetchLoRes
};
