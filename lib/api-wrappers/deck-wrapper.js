var reqlib = require('app-root-path').require
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper.js')
  , Deck = reqlib('lib/models/deck')
  ;

function DeckWrapper(delegate, userId, needsUpgrade, cardCount) {
  if (!delegate) {
    throw new TypeError('missing delegate');
  }

  this.wrapped = new MongooseWrapper(delegate);

  this.toJSON = function() {
    var json = this.wrapped.toJSON(); 
    json.isOwner = delegate.userId == userId;
    json.needsUpgrade = needsUpgrade;
    json.cardCount = cardCount;
    return json;
  }
}

function newInstance(delegate, userId, cardCount) {
  return delegate.needsUpgrade()
    .then((needsUpgrade) => {
      return new DeckWrapper(delegate, userId, needsUpgrade, cardCount)
    });
}
module.exports.newInstance = newInstance;

module.exports.wrapAll = function(delegates, userId) {
  return Deck.cardCountsByDeckId(delegates)
    .then((counts) => {
      return Promise.all(delegates.map((delegate) => {
        return newInstance(delegate, userId, counts[delegate._id]);
      }));
    });
}
