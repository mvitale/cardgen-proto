var reqlib = require('app-root-path').require;
/*
 * Represents a file path and metadata about the file stored there, including
 * a fingerprint that can be used for checking if a given file is already
 * present/saved.
 */
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var fileUtil = reqlib('lib/models/util/file-util');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DedupFileSchema = new Schema({
  path: { type: String, required: true },
  digest: { type: String, index: true, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  userId: { type: Number, required: true },
  appId: { type: String, required: true }
});

function findOrCreateFromBuffer(buffer, appId, userId, destination, cb) {
  var that = this
    , digest = fileUtil.createDigest(buffer);

  that.findOne({
    userId: userId,
    digest: digest,
    appId: appId
  }, (err, result) => {
    if (err) return cb(err);

    if (result) {
      return cb(null, result, false);
    } else {
      return fileUtil.randomFilename((err, filename) => {
        if (err) return cb(err);

        var type = fileUtil.fileType(buffer)
          , finalPath = null
          , outStream = null
          ;

        if (!type) {
          return cb(new Error('Unable to determine file type of buffer'));
        }

        finalPath = path.join(destination, filename + '.' + type.ext);

        outStream = fs.createWriteStream(finalPath)

        outStream.end(buffer);
        outStream.on('error', cb);
        outStream.on('finish', () => {
          that.create({
            path: finalPath,
            digest: digest,
            size: outStream.bytesWritten,
            mimeType: type.mime,
            userId: userId,
            appId: appId
          }, (err, result) => {
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
};

DedupFileSchema.methods.read = function(cb) {
  fileUtil.read(this.path, cb);
};

DedupFileSchema.statics.new = function(data) {
  var that = this;
  return new that(data);
};

module.exports = mongoose.model('DedupFile', DedupFileSchema);
