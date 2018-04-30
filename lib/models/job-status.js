var reqlib = require('app-root-path').require
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var jobStatusSchema = new Schema({
  jobId: {
    type: String,
    required: true,
    tags: {
      type: [String],
      index: true
    }
  },
  status: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('JobStatus', jobStatusSchema);

