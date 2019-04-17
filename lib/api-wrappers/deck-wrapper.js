var reqlib = require('app-root-path').require
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper.js')
  , Deck = reqlib('lib/models/deck')
  ;

function DeckWrapper(delegate, userId, needsUpgrade, cards) {
  if (!delegate) {
    throw new TypeError('missing delegate');
  }

  const cardValues = buildCardValues(cards);

  this.wrapped = new MongooseWrapper(delegate);

  this.toJSON = function() {
    var json = this.wrapped.toJSON(); 
    json.isOwner = delegate.userId == userId;
    json.needsUpgrade = needsUpgrade;
    json.cardIds = cardValues.cardIds;
    json.titleCardId = cardValues.titleCardId;
    return json;
  }
}

function buildCardValues(cards) {
  var cardIds = []
    , titleCardId = null
    ;

  cards.forEach((card) => {
    cardIds.push(card._id); 

    if (!titleCardId && card.templateName === 'title') {
      titleCardId = card._id;
      
    }
  });

  return { cardIds, titleCardId };
}

function newInstance(delegate, userId, cardCount) {
  return delegate.needsUpgrade()
    .then((needsUpgrade) => {
      return new DeckWrapper(delegate, userId, needsUpgrade, cardCount)
    });
}
module.exports.newInstance = newInstance;

module.exports.wrapAll = function(delegates, userId) {
  return Deck.cardsForDecks(delegates)
    .then((cardsById) => {
      return Promise.all(delegates.map((delegate) => {
        return newInstance(delegate, userId, cardsById[delegate._id]);

      }));
    });
}

