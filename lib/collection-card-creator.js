var reqlib = require('app-root-path').require;
var uuid = require('uuid')
  , LRU = require('lru-cache')
  , Card = reqlib('lib/models/card')
  , eolApiCaller = reqlib('lib/api-callers/eol-api-caller')
  , CollectionCardsJob = reqlib('lib/collection-cards-job')
  ;

var jobs = LRU({
      max: 10000,
      maxAge: 1000 * 60 * 3
    });
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

function createJob(appId, userId, locale, deck, colId, log) {
  return getCollectionTaxa(colId, log)
    .then(function(ids) {
      var job = CollectionCardsJob.new(appId, userId, locale, deck, ids, log);
      jobs.set(job.id, job);
      job.start();
      return job.id;
    });
}
module.exports.createJob = createJob;

function jobStatus(id) {
  var status = 'unknown'
    , job = jobs.get(id)
    ;

  if (job) {
    status = job.status();
  }

  return status;
}
module.exports.jobStatus = jobStatus;
