var util = require('_/suppliers/default/util/util');

module.exports.supply = function(params, apiResults, choices, tips, cb) {
  var result = util.hierarchyDisplayName(apiResults);

  if (result === null) {
    result = '';
  }

  cb(null, { text: result });
}
