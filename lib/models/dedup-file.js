/*
 * Represents a file path and metadata about the file stored there, including
 * a fingerprint that can be used for checking if a given file is already
 * present/saved.
 */
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var fileType = require('file-type');

var fileUtil = require('./util/file-util');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DedupFileSchema = new Schema({
  path: { type: String, required: true },
  digest: { type: String, index: true, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  userId: { type: Number, required: true }
});

function createDigest(buffer) {
  var hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('base64');
}

function findOrCreateFromBuffer(buffer, userId, destination, cb) {
  var that = this
    , digest = createDigest(buffer);

  that.findOne({ digest: digest }, function(err, result) {
    if (err) return cb(err);

    if (result) {
      return cb(null, result, false);
    } else {
      return fileUtil.randomFilename((err, filename) => {
        if (err) return cb(err);

        var type = fileType(buffer)
          , finalPath = null
          , outStream = null
          ;

        if (!type) {
          return cb(new Error('Unable to determine file type of buffer'));
        }

        finalPath = path.join(destination, filename + '.' + type.ext);
        outStream = fs.createWriteStream(finalPath)

        outStream.end(buffer);
        outStream.on('error', cb)
        outStream.on('finish', function() {
          that.create({
            path: finalPath,
            digest: digest,
            size: outStream.bytesWritten,
            mimeType: type.mime,
            userId: userId
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
  fileUtil.read(this, cb);
}

var DedupFile = mongoose.model('DedupFile', DedupFileSchema);
module.exports = DedupFile;
