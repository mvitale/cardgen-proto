/*
 * Mongoose model wrapper where toJSON produces output suitable for api responses.
 * Recursively applies the following transformations to the model's native
 * toJSON result:
 * _id -> id
 * delete userId
 * delete __v
 *
 * Any values mapped to by keys beginning with _ also have these transformations
 * applied.
 */

var mongoose = require('mongoose');

function MongooseWrapper(delegate) {
  this.delegate = delegate;

  this.toJSON = function() {
    var json = this.delegate.toJSON()
      , curObj = null
      , objStack = [json]
      ;

    while (objStack.length > 0) {
      curObj = objStack.pop();

      curObj.id = curObj._id;
      delete curObj['userId'];
      delete curObj['appId'];
      delete curObj['_id'];
      delete curObj['__v'];

      var keys = Object.keys(curObj);
      keys.forEach(function(key) {
        var val = curObj[key];

        // naming convention is that _ prefixed keys are for models
        // TODO: this is all pretty fragile
        if (key.startsWith('_')) {
          // get rid of _ prefix in key
          curObj[key.substring(1)] = val;
          delete curObj[key];

          if (typeof val === "object" &&
              !(val instanceof mongoose.Types.ObjectId) &&
              val !== null)
          {
            objStack.push(val);
          }
        }
      });
    }

    return json;
  }
}

module.exports = MongooseWrapper;
