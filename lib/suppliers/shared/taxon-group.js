var util = require('_/suppliers/shared/util')
  ;

var hierarchyMappings = {
      kingdom: {
        Bacteria: 'annelids',
        Archaea: 'archaea',
        Fungi: 'fungi',
        Plantae: 'plants',
        Animalia: 'animals'
      },
      phylum: {
        Annelida: 'annelids',
        Echinodermata: 'echinoderms',
        Mollusca: 'mollusks',
        Porifera: 'sponges',
        Cnidaria: 'cnidarians',
        Platyhelminthes: 'platyhelminthes',
        Nematoda: 'nematodes',
        Arthropoda: 'arthropods'
      },
      class: {
        Reptilia: 'reptiles',
        'Reptilia Laurenti, 1768': 'reptiles',
        Aves: 'birds',
        Amphibia: 'amphibians',
        Elasmobranchii: 'fishes',
        Actinopterygii: 'fishes',
        Sarcopterygii: 'fishes',
        Cephalaspidomorphi: 'fishes',
        Holocephali: 'fishes',
        Myxini: 'fishes',
        Mammalia: 'mammals'
      }
    }
  , taxonRankOrder = ['class', 'phylum', 'kingdom']
  , specialCaseTaxa = {
      Animalia:  'eukaryotes',
      Plantae:   'eukaryotes',
      Fungi:     'eukaryotes',
      Protista:  'eukaryotes',
      Archaea:   'cellularOrganisms',
      Bacteria:  'cellularOrganisms',
      Eukarya:   'cellularOrganisms',
      Eukaryota: 'cellularOrganisms'
    }
  , taxonGroups = uniqueTaxonGroups();
  ;

module.exports.lowestTaxonGroupKey = function(taxon, ancestors) {
  var taxonRankResult
    , sciName
    , taxonRank
    , result = null
    ;

  if (taxon in specialCaseTaxa) {
    return specialCaseTaxa[taxon];
  }

  for (var i = 0; i < taxonRankOrder.length && result === null; i++) {
    taxonRank = taxonRankOrder[i];

    taxonRankResult = ancestors.find((ancestor) => {
      return ancestor.taxonRank === taxonRank;
    });

    if (taxonRankResult && taxonRankResult.scientificName) {
      sciName = taxonRankResult.scientificName;
      result = taxonGroupKey(taxonRank, sciName);
    }
  }

  return result;
}

function taxonGroupKey(taxonRank, sciName) {
  var taxonRankMappings = hierarchyMappings[taxonRank]
    , key = null
    ;

  if (taxonRankMappings && sciName in taxonRankMappings) {
    key = taxonRankMappings[sciName];
  }

  return key;
}
module.exports.taxonGroupKey = taxonGroupKey;

module.exports.taxonGroupKeys = function() {
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

  Object.keys(specialCaseTaxa).forEach((key) => {
    allGroups.push(specialCaseTaxa[key]);
  });

  return util.sortUniq(allGroups);
}
