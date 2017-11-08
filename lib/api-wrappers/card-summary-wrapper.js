var reqlib = require('app-root-path').require;
var MongooseWrapper = require('_/api-wrappers/mongoose-wrapper');

function CardSummaryWrapper(delegate) {
  this.delegate = delegate;

  this.toJSON = function() {
    var json = {};

    json.id = this.delegate._id;
    json.deck = this.delegate._deck != null ?
      new MongooseWrapper(this.delegate._deck) :
      null;

    return json;
  }
}

module.exports = CardSummaryWrapper;
