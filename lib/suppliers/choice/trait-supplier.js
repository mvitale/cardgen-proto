var traits = require('_/suppliers/shared/traits');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, traits.allTraits());
}
