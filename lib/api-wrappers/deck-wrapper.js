var reqlib = require('app-root-path').require
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper.js')
  ;

function DeckWrapper(delegate, userId) {
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
    return json;
  }
}
module.exports = DeckWrapper;
