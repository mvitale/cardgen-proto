var crypto = require('crypto');
var path = require('path');
var fs = require('fs');

module.exports.randomFilename = function(cb) {
  crypto.pseudoRandomBytes(16, (err, raw) => {
    cb(err, err ? undefined : raw.toString('hex'));
  });
};

module.exports.read = function(fileModel, cb) {
  fs.readFile(fileModel.path, cb);
};
