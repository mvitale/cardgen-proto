var reqlib = require('app-root-path').require
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper.js')
  ;

function DeckWrapper(delegate, userId, needsUpgrade) {
  if (!delegate) {
    throw new TypeError('missing delegate');
  }

  this.wrapped = new MongooseWrapper(delegate);

  this.toJSON = function() {
    var json = this.wrapped.toJSON(); 
    json.isOwner = delegate.userId == userId;
    json.needsUpgrade = needsUpgrade;
    return json;
  }
}

function newInstance(delegate, userId) {
  return delegate.needsUpgrade()
    .then((needsUpgrade) => {
      return new DeckWrapper(delegate, userId, needsUpgrade)
    });
}
module.exports.newInstance = newInstance;

module.exports.wrapAll = function(delegates, userId) {
  return Promise.all(delegates.map((delegate) => {
    return newInstance(delegate, userId);
  }));
}
