/*
 * Represents a file path and metadata about the file stored there, including
 * a fingerprint that can be used for checking if a given file is already
 * present/saved.
 */
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DedupFileSchema = new Schema({
  path: { type: String, required: true },
  digest: { type: String, index: true, required: true},
  size: { type: Number, required: true },
  contentType: { type: String, required: true }
});

function createDigest(buffer) {
  var hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('base64');
}

function getFilename (cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

function findOrCreateFromBuffer(buffer, destination, contentType, cb) {
  var that = this
    , digest = createDigest(buffer);

  that.findOne({ digest: digest }, function(err, result) {
    if (err) return cb(err);

    var finalPath = null
      , outStream = null
      ;

    if (result) {
      return cb(null, result, false);
    } else {
      return getFilename((err, filename) => {
        finalPath = path.join(destination, filename)
        outStream = fs.createWriteStream(finalPath)

        outStream.end(buffer);
        outStream.on('error', cb)
        outStream.on('finish', function() {
          that.create({
            path: finalPath,
            digest: digest,
            size: outStream.bytesWritten,
            contentType: contentType
          }, function(err, result) {
            cb(err, result, true);
          });
        });
      });
    }
  });
}
DedupFileSchema.statics.findOrCreateFromBuffer = findOrCreateFromBuffer;

DedupFileSchema.methods.removeIncludingFile = function(cb) {
  this.remove(function(err, dedupFile) {
    if (err) return cb(err);

    fs.unlink(dedupFile.path, cb);
  });
}

DedupFileSchema.methods.read = function(cb) {
  fs.readFile(__dirname + '/../' + this.path, (err, buffer) => {
    if (err) return cb(err);

    return cb(null, buffer);
  });
}

var DedupFile = mongoose.model('DedupFile', DedupFileSchema);
module.exports = DedupFile;
