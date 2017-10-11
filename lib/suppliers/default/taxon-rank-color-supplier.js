var taxonGroupUtil = require('_/suppliers/shared/taxon-group');

var taxonRankToTips = {
  Animals: 'Other animals'
};

module.exports.supply = function(params, data, choices, tips, cb) {
  var taxonRank = taxonGroupUtil.hierarchyDisplayName(data, true)
    , choiceIndex = choices.length - 1 // Pick last one if no match
    , tipsIndex
    ;

  if (taxonRank) {
    if (taxonRank in taxonRankToTips) {
      taxonRank = taxonRankToTips[taxonRank];
    }

    tipsIndex = tips.indexOf(taxonRank);

    if (tipsIndex) {
      choiceIndex = tipsIndex;
    }
  }

  return cb(null, null, choiceIndex);
}
