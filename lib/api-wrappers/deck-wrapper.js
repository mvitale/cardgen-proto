var reqlib = require('app-root-path').require
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper.js')
  ;

function DeckWrapper(delegate, userId, needsUpgrade) {
  if (!delegate) {
    throw new TypeError('missing delegate');
  }

  if (!userId) {
    throw new TypeError('missing userId');
  }

  this.wrapped = new MongooseWrapper(delegate);

  this.toJSON = function() {
    var json = this.wrapped.toJSON(); 
    json.isOwner = delegate.userId == userId;
    json.needsUpgrade = needsUpgrade;
    return json;
  }
}

module.exports.newInstance = function(delegate, userId) {
  return delegate.needsUpgrade()
    .then((needsUpgrade) => {
      return new DeckWrapper(delegate, userId, needsUpgrade)
    });
}

