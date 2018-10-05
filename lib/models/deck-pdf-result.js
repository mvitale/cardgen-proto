var appRootPath = require('app-root-path')
  , reqlib = appRootPath.require
  , pathUtils = reqlib('lib/path-utils')
  , path = require('path')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var fileDirPath = pathUtils.storagePath('deck_pdfs');

var DeckPdfResultSchema = new Schema({
  jobId: {
    type: String,
    required: true,
    tags: {
      type: [String],
      index: true
    }
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number
  }
}, {
  timestamps: true
});

function buildWriteStream(jobId, cb) {
  var that = this
    , filePath = path.join(fileDirPath, jobId + '.pdf')
    , outStream = fs.createWriteStream(filePath)
    ;

  outStream.on('error', cb);
  outStream.on('finish', () => {
    that.create({
      jobId: jobId,
      path: filePath,
      size: outStream.bytesWritten
    }, cb);
  });

  return outStream;
}
DeckPdfResultSchema.statics.buildWriteStream = buildWriteStream;

function getPath(jobId) {
  var that = this; 

  return that.findOne({
    jobId: jobId
  }).exec().then((result) => {
    return result.path;
  });
}
DeckPdfResultSchema.statics.getPath = getPath;

module.exports = mongoose.model('DeckPdfResult', DeckPdfResultSchema);
