var reqlib = require('app-root-path').require;
var MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper');
var CardWrapper = reqlib('lib/template-renderer/card-wrapper');

function CardSummaryWrapper(delegate, wrapped) {
  this.delegate = delegate;
  this.wrapped = wrapped;

  this.toJSON = function() {
    var json = {};

    json.id = this.delegate._id;
    json.deck = this.delegate._deck != null ?
      new MongooseWrapper(this.delegate._deck) :
      null;
    json.public = this.delegate.public;
    json.createdAt = this.delegate.createdAt;
    json.updatedAt = this.delegate.updatedAt;
    json.version = this.delegate.version;
    json.locale = this.delegate.locale;
    json.templateName = this.delegate.templateName;

    json.commonName = this.wrapped.fieldNameValid('commonName') ? 
      this.wrapped.getDataAttr('commonName', 'text', '') : '';
    json.sciName = this.wrapped.fieldNameValid('sciName') ? 
      this.wrapped.getDataAttr('sciName', 'text', '') : '';
    json.taxonGroup = this.wrapped.fieldNameValid('taxonClass') ?
      this.wrapped.getDataAttr('taxonClass', 'text', '') : '';

    return json;
  }
}

function newInstance(delegate) {
  return new Promise((resolve, reject) => {
    CardWrapper.newInstance(delegate, {}, (err, wrapped) => {
      if (err) {
        return reject(err);
      }
      
      resolve(new CardSummaryWrapper(delegate, wrapped));
    });
  });
}
module.exports.new = newInstance;
