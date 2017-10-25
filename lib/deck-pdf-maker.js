var PngBatchJob = require('_/png-batch-job').PngBatchJob

var jobs = {};

function startJob(cards, logger) {
  var job = new PngBatchJob(cards, logger);
  jobs[job.id] = job;
  job.start()
    .then((pngs) => {
      logger.info('Made the pngs!!!');
      delete jobs[job.id];
    })
    .catch((err) => {
      logger.error(err);
      delete jobs[job.id];
    });

  return job.id;
}
module.exports.startJob = startJob;
