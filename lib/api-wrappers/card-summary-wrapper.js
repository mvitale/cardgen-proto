var reqlib = require('app-root-path').require;
var MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper');
var CardWrapper = reqlib('lib/template-renderer/card-wrapper');

function CardSummaryWrapper(delegate, wrapped) {
  this.delegate = delegate;

  this.toJSON = function() {
    var json = {};

    json.id = this.delegate._id;
    json.deck = this.delegate._deck != null ?
      new MongooseWrapper(this.delegate._deck) :
      null;
    json.public = this.delegate.public;

    // TODO: These fields, which are used for search/sort in the client, should
    // be specified in the template, not hard coded. It's ok for now since we only
    // have one template.
    json.commonName = wrapped.getDataAttr('commonName', 'text', '');
    json.sciName = wrapped.getDataAttr('sciName', 'text', '');

    return json;
  }
}

function newInstance(delegate) {
  return new Promise((resolve, reject) => {
    CardWrapper.newInstance(delegate, (err, wrapped) => {
      if (err) {
        return reject(err);
      }
      
      resolve(new CardSummaryWrapper(delegate, wrapped));
    });
  });
}
module.exports.new = newInstance;
