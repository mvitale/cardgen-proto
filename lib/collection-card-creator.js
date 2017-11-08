var reqlib = require('app-root-path').reqlib;
var uuid = require('uuid')
  , LRU = require('lru-cache')
  , Card = require('_/models/card')
  , eolApiCaller = require('_/api-callers/eol-api-caller')
  , CollectionCardsJob = require('_/collection-cards-job')
  ;

var jobs = LRU({
      max: 10000,
      maxAge: 1000 * 60 * 3
    });
  ;

function getCollectionTaxa(id) {
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

    eolApiCaller.getJson('collections', params, (err, result) => {
      if (err) {
        return reject(err);
      }

      if (!(result.collection_items)) {
        return reject(new Error('collection_items missing from collections result'));
      }

      result.collection_items.forEach(function(item) {
        taxonIds.push(item.object_id);
      });

      resolve(taxonIds);
    });
  });
}

function createJob(appId, userId, locale, deck, colId, log) {
  return new Promise((resolve, reject) => {
    getCollectionTaxa(colId)
      .then(function(ids) {
        var job = CollectionCardsJob.new(appId, userId, locale, deck, ids, log);
        jobs.set(job.id, job);
        job.start();
        resolve(job.id);
      })
      .catch(reject);
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
