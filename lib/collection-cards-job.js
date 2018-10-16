var reqlib = require('app-root-path').require;
var uuid = require('uuid')
  , Card = reqlib('lib/models/card')
  ;

function CollectionCardsJob(appId, userId, locale, deck, taxonIds, parentLog) {
  var that = this
    , pendingCount = taxonIds.length
    , log
    , status = 'created'
    , cards
    , failedIds
    ;

  if (!taxonIds.length) {
    throw new TypeError('taxonIds empty');
  }

  that.id = uuid();
  log = parentLog.child({
    cardsJobId: that.id
  });

  that.start = function() {
    if (status !== 'created') {
      throw new TypeError('job already started');
    }

    log.info({ taxonIds: taxonIds }, 'Starting CardsJob');
    return makeCards();
  }

  that.failedIds = function() {
    return failedIds.slice();
  }

  that.cards = function() {
    return cards.slice();
  }

  that.status = function() {
    return status;
  }

  function makeCards() {
    status = 'running';

    var curId
      , card
      , cards = []
      , failedIds = []
      , promises = []
      ;

    taxonIds.forEach((id) => {
      promises.push(
        makeCard(id)
          .then((card) => {
            cards.push(card);
          })
          .catch((err) => {
            log.error({
              taxonId: id,
              err: err
            }, 'Failed to create card');
            failedIds.push(id);
          })
      );
    });

    return Promise.all(promises)
  }

  function makeCard(taxonId) {
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

    return card.populateDefaultsAndChoices(log)
      .then(() => {
        return card.save().exec();
      });
  }
}

module.exports.new = function() {
  return new CollectionCardsJob(...Array.from(arguments));
};

