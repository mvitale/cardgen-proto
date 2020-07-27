var reqlib = require('app-root-path').require
  , uuid = require('uuid')
  , Card = reqlib('lib/models/card')
  , eolApiCaller = reqlib('lib/api-callers/eol-api-caller')
  , CollectionCardsJob = reqlib('lib/collection-cards-job')
  , JobStatus = reqlib('lib/models/job-status')
  ;

function getCollectionTaxa(id, log) {
  var params = {
        id: id,
        page: 1,
        per_page: 50,
        filter: 'taxa',
        sort_by: 'recently_added',
        language: 'en'
      }
    ;

  log.debug({}, 'call eol for collection result');
  return eolApiCaller.getJson('collections', params, log)
  .then((result) => {
    log.debug({}, 'got collection result from eol');
    if (!result.collection_items) {
      throw new Error('collection_items missing from collections result');
    }

    if (!result.collection_items.length) {
      throw new Error('collection_items empty');
    }

    return result.collection_items.map((item) => {
      return item.object_id;
    });
  });
}

function runJob(jobId, appId, userId, locale, deck, colId, log) {
  log.debug({ jobId: jobId }, 'start collection job');
  getCollectionTaxa(colId, log)
    .then((ids) => {
      log.debug({ jobId: jobId }, 'collection job got taxon ids');
      var job = CollectionCardsJob.new(appId, userId, locale, deck, ids, log);
      return job.start();
    }).then((cards) => {
      return JobStatus.findByIdAndUpdate(jobId, {
        $set: {
          status: 'done'
        }
      });
    }).catch((err) => {
      log.error({ err: err, jobId: jobId }, 'collection job failed');
      return JobStatus.findByIdAndUpdate(jobId, {
        $set: {
          status: 'failed'
        }
      });
    });
}
module.exports.runJob = runJob;

function createJob() {
  return JobStatus.create({
    status: 'running',
    type: 'collectionCards'
  }).then((jobStatus) => {
    return jobStatus._id;
  });
}
module.exports.createJob = createJob;

function jobStatus(id) {
  return JobStatus.findOne({
    _id: id
  }).then((jobStatus) => {
    return (jobStatus && jobStatus.status) || 'unknown';
  });
}
module.exports.jobStatus = jobStatus;

