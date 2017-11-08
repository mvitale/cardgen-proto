var reqlib = require('app-root-path').reqlib;
var traits = require('_/suppliers/shared/traits');

module.exports.supply = function(params, data, locale, cb) {
  cb(null, traits.allTraits().map((trait) => {
    return {
      text: trait,
      choiceKey: trait,
    }
  }));
}
