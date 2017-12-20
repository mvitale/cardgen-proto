var reqlib = require('app-root-path').require;
var MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper');

function CardSummaryWrapper(delegate) {
  this.delegate = delegate;

  this.toJSON = function() {
    var json = {};

    json.id = this.delegate._id;
    json.deck = this.delegate._deck != null ?
      new MongooseWrapper(this.delegate._deck) :
      null;
    json.public = this.delegate.public;

    return json;
  }
}

module.exports = CardSummaryWrapper;
