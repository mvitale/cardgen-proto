var reqlib = require('app-root-path').require
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper.js')
  ;

function DeckWrapper(delegate, userId, needsUpgrade, titleCardId) {
  if (!delegate) {
    throw new TypeError('missing delegate');
  }

  this.wrapped = new MongooseWrapper(delegate);

  this.toJSON = function() {
    var json = this.wrapped.toJSON(); 
    json.isOwner = delegate.userId == userId;
    json.needsUpgrade = needsUpgrade;
    json.titleCardId = titleCardId;
    return json;
  }
}

function newInstance(delegate, userId) {
  var needsUpgrade
    , titleCardId
    ;

  return delegate.needsUpgrade()
    .then((value) => {
      needsUpgrade = value;
      return delegate.titleCard();
    })
    .then((card) => {
      titleCardId = card ? card._id : null;
      return new DeckWrapper(delegate, userId, needsUpgrade, titleCardId);
    });
}
module.exports.newInstance = newInstance;

module.exports.wrapAll = function(delegates, userId) {
  return Promise.all(delegates.map((delegate) => {
    return newInstance(delegate, userId);
  }));
}
