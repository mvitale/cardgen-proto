var reqlib = require('app-root-path').require
  , PdfJob = reqlib('lib/models/pdf-job')
  , PngJob = reqlib('lib/models/png-job')
  ;

var typesToModels = {
  'pdf': PdfJob,
  'png': PngJob
};

function define(agenda, logger) {
  agenda.define('download', (job, done) => {
    var model = typesToModels[job.attrs.data.type];

    model.findOne({
      _id: job.attrs.data.objectId
    }).exec().then((instance) => {
      instance.run(logger, done);
    }).catch((err) => {
      job.fail(err);
      job.save();
      done();
    });
  });
}
module.exports.define = define;
