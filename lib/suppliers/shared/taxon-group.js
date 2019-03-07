var reqlib = require('app-root-path').require;
var util = reqlib('lib/suppliers/shared/util')
  ;

var hierarchyMappings = {
      kingdom: {
        Bacteria: 'bacteria',
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
  //      Amphibia: 'amphibians',
        Elasmobranchii: 'fishes',
        Actinopterygii: 'fishes',
        Sarcopterygii: 'fishes',
        Cephalaspidomorphi: 'fishes',
        Holocephali: 'fishes',
        Myxini: 'fishes',
        Mammalia: 'mammals'
      },
      clade: {
        Lissamphibia: 'amphibians'
      }
    }
  , taxonRankOrder = ['clade', 'class', 'phylum', 'kingdom']
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

    taxonRankResults = ancestors.filter((ancestor) => {
      return ancestor.taxonRank === taxonRank && ancestor.scientificName;
    });

    for (var j = 0; j < taxonRankResults.length && result === null; j++) {
      taxonRankResult = taxonRankResults[j];
      result = taxonGroupKey(taxonRank, taxonRankResult.scientificName);
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
