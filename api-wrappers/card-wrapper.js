function CardWrapper(card) {
  this.delegate = card;

  this.toJSON = function() {
    var json = this.delegate.toJSON();

    json.id = json._id;
    delete json['_id'];
    delete json['__v'];

    return json;
  }
}

module.exports = CardWrapper;
