var reqlib = require('app-root-path').require
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var jobStatusSchema = new Schema({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobStatus', jobStatusSchema);

