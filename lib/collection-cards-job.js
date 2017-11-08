var reqlib = require('app-root-path').require;
var uuid = require('uuid')
  , Card = require('_/models/card')
  ;

function CollectionCardsJob(appId, userId, locale, deck, taxonIds, parentLog) {
  var that = this
    , pendingCount = taxonIds.length
    , log
    , status = 'created'
    , cards
    , failedIds
    ;

  that.id = uuid();
  log = parentLog.child({
    cardsJobId: that.id
  });

  that.start = function() {
    if (status !== 'created') {
      throw new TypeError('job already started');
    }

    log.info({ taxonIds: taxonIds }, 'Starting CardsJob');
    makeCards();
  }

  that.failedIds = function() {
    return failedIds.slice(0);
  }

  that.cards = function() {
    return cards.slice();
  }

  that.status = function() {
    return status;
  }

  function checkIfDone() {
    if (--pendingCount === 0) {
      status = 'done';
    }
  }

  function makeCards() {
    status = 'running';

    var curId
      , card
      , cards = []
      , failedIds = []
      ;

    taxonIds.forEach((id) => {
      makeCard(id)
        .then((card) => {
          cards.push(card);
          checkIfDone();
        })
        .catch((err) => {
          log.error({
            taxonId: id,
            err: err
          }, 'Failed to create card');
          failedIds.push(id);
          checkIfDone();
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
        , card = Card.new(options)
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
module.exports.new = function() {
  return new CollectionCardsJob(...Array.from(arguments));
};
