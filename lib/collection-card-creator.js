var reqlib = require('app-root-path').require
  , uuid = require('uuid')
  , Card = reqlib('lib/models/card')
  , eolApiCaller = reqlib('lib/api-callers/eol-api-caller')
  , CollectionCardsJob = reqlib('lib/collection-cards-job')
  , JobStatus = reqlib('lib/models/job-status')
  ;

function getCollectionTaxa(id, log) {
  return new Promise(function(resolve, reject) {
    var params = {
          id: id,
          page: 1,
          per_page: 50,
          filter: 'taxa',
          sort_by: 'recently_added',
          language: 'en'
        }
      , taxonIds = []
      ;

    eolApiCaller.getJson('collections', params, log, (err, result) => {
      if (err) {
        return reject(err);
      }

      if (!result.collection_items) {
        return reject(new Error('collection_items missing from collections result'));
      }

      if (!result.collection_items.length) {
        return reject(new Error('collection_items empty'));
      }

      result.collection_items.forEach(function(item) {
        taxonIds.push(item.object_id);
      });

      resolve(taxonIds);
    });
  });
}

function runJob(jobId, appId, userId, locale, deck, colId, log) {
  getCollectionTaxa(colId, log)
    .then((ids) => {
      var job = CollectionCardsJob.new(appId, userId, locale, deck, ids, log);
      return job.start()
    }).then((cards) => {
      return JobStatus.findByIdAndUpdate(jobId, {
        $set: {
          status: 'done'
        }
      })
    }).catch((err) => {
      log.error({ jobId: jobId }, 'runJob failed');
    })
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

