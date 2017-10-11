var util = require('_/suppliers/shared/util');

var hierarchyMappings = {
      kingdom: {
        Bacteria: 'Bacteria',
        Archaea: 'Archaea',
        Fungi: 'Fungi',
        Plantae: 'Plants',
        Animalia: 'Animals'
      },
      phylum: {
        Annelida: 'Annelids',
        Echinodermata: 'Echinoderms',
        Mollusca: 'Mollusks',
        Porifera: 'Sponges',
        Cnidaria: 'Cnidarians',
        Platyhelminthes: 'Platyhelminthes',
        Nematoda: 'Nematodes',
        Arthropoda: 'Arthropods'
      },
      class: {
        Reptilia: 'Reptiles',
        'Reptilia Laurenti, 1768': 'Reptiles',
        Aves: 'Birds',
        Amphibia: 'Amphibians',
        Elasmobranchii: 'Fishes',
        Actinopterygii: 'Fishes',
        Sarcopterygii: 'Fishes',
        Cephalaspidomorphi: 'Fishes',
        Holocephali: 'Fishes',
        Myxini: 'Fishes',
        Mammalia: 'Mammals'
      }
    }
  , taxonRankOrder = ['class', 'phylum', 'kingdom']
  , taxonGroups = uniqueTaxonGroups();
  ;

module.exports.hierarchyDisplayName = function(apiResults, includeSelf) {
  var ancestors = apiResults.hierarchy_entries.ancestors.slice()
    , taxonRankResult
    , sciName
    , taxonRank
    , taxonRankMapping
    , result = null
    ;

  if (includeSelf) {
    ancestors.unshift(apiResults.pages.taxonConcepts[0]);
  }

  for (var i = 0; i < taxonRankOrder.length && result === null; i++) {
    taxonRank = taxonRankOrder[i];
    taxonRankMapping = hierarchyMappings[taxonRank];

    taxonRankResult = ancestors.find((result) => {
      return result.taxonRank.toLowerCase() === taxonRank;
    });

    if (taxonRankResult && taxonRankResult.scientificName) {
      sciName = taxonRankResult.scientificName;

      if (sciName in taxonRankMapping) {
        result = taxonRankMapping[sciName];
      }
    }
  }

  return result;
}

module.exports.taxonGroups = function() {
  return taxonGroups;
}

function uniqueTaxonGroups() {
  var allGroups = [];

  taxonRankOrder.forEach(function(taxonGroup) {
    var rankMappings = hierarchyMappings[taxonGroup];

    for (key in rankMappings) {
      allGroups.push(rankMappings[key]);
    }
  });

  return util.sortUniq(allGroups);
}
