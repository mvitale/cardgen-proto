var reqlib = require('app-root-path').require
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var deckPdfResultSchema = new Schema({
  jobId: {
    type: String,
    required: true,
    tags: {
      type: [String],
      index: true
    }
  },
  result: {
    type: Buffer,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeckPdfResult', deckPdfResultSchema);
