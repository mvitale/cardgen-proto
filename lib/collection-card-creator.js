var uuid = require('uuid')
  , LRU = require('lru-cache')
  , Card = require('_/models/card')
  , eolApiCaller = require('_/api-callers/eol-api-caller')
  ;

var cardsJobs = {}
  , doneJobs = LRU({
      max: 100
    })
  ;

function CardsJob(appId, userId, locale, deck, taxonIds, parentLog) {
  var that = this
    , pendingCount = taxonIds.length
    , log
    ;

  that.id = uuid();
  log = parentLog.child({
    cardsJobId: that.id
  });

  that.start = function() {
    cardsJobs[that.id] = that;
    log.info({ taxonIds: taxonIds }, 'Starting CardsJob');
    makeCards();
  }

  function cardDone() {
    if (--pendingCount === 0) {
      delete cardsJobs[that.id];
      doneJobs.set(that.id, that.id);
    }
  }

  function makeCards() {
    var curId
      , card
      ;

    taxonIds.forEach(function(id) {
      makeCard(id)
        .then(cardDone)
        .catch(function(err) {
          log.error({
            taxonId: id,
            err: err
          }, 'Failed to create card');
          cardDone();
        });
    });
  }

  function makeCard(taxonId) {
    return new Promise(function(resolve, reject) {
      var options = {
            templateName: 'trait',
            templateParams: {
              speciesId: taxonId
            },
            userId: userId,
            appId: appId,
            locale: locale,
            _deck: deck
          }
        , card = new Card(options)
        ;

      card.populateDefaultsAndChoices((err) => {
        if (err) return reject(err);

        card.save((err, card) => {
          if (err) return reject(err);
          resolve(card);
        });
      });
    });
  }
}

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
        var job = new CardsJob(appId, userId, locale, deck, ids, log);
        job.start();
        resolve(job.id);
      })
      .catch(reject);
  });
}
module.exports.createJob = createJob;

function jobStatus(id) {
  var status = 'dead';

  if (id in cardsJobs) {
    status = 'pending';
  } else if (doneJobs.peek(id)) {
    status = 'done';
  }

  return status;
}
module.exports.jobStatus = jobStatus;
