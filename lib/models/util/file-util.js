var reqlib = require('app-root-path').require;
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var fileTypeDelegate = require('file-type');

module.exports.randomFilename = function(cb) {
  crypto.pseudoRandomBytes(16, (err, raw) => {
    cb(err, err ? undefined : raw.toString('hex'));
  });
};

module.exports.read = function(fileModel, cb) {
  fs.readFile(fileModel.path, cb);
};

module.exports.createDigest = function(buffer) {
  var hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('base64');
};

module.exports.fileType = function(buffer) {
  return fileTypeDelegate(buffer);
}
