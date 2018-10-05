var reqlib = require('app-root-path').require;
var taxonGroupUtil = reqlib('lib/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, choices, tips, locale) {
  return new Promise((resolve, reject) => {
    resolve({
      choiceKey: data.taxon.taxonGroupKey
    });
  });
};

