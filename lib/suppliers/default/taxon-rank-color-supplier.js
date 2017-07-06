var util = require('_/suppliers/default/util/util');

var taxonRankToTips = {
  Animals: 'Other animals'
}

module.exports.supply = function(params, apiResults, choices, tips, cb) {
  var taxonRank = util.hierarchyDisplayName(apiResults)
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
