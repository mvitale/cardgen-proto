function MongooseWrapper(delegate) {
  this.delegate = delegate;

  this.toJSON = function() {
    var json = this.delegate.toJSON();

    json.id = json._id;
    delete json['userId'];
    delete json['_id'];
    delete json['__v'];

    return json;
  }
}

module.exports = MongooseWrapper;
