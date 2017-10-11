var taxonGroupUtil = require('_/suppliers/shared/taxon-group');

module.exports.supply = function(params, data, locale, cb) {
  cb(null, taxonGroupUtil.taxonGroups().map((group) => {
    return { text: group, choiceKey: group }
  }));
};
