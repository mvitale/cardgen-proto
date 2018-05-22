var reqlib = require('app-root-path').require;
var traits = reqlib('lib/suppliers/shared/traits');

// TODO: update format of choices (key -> choice)
module.exports.supply = function(params, data, locale, cb) {
  cb(null, traits.allTraits().map((trait) => {
    return {
      text: trait,
      choiceKey: trait,
    }
  }));
}
