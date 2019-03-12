var reqlib = require('app-root-path').require;
var util = reqlib('lib/suppliers/shared/util')
  ;

var inclusionClades = {
      Bacteria: 'bacteria',
      Archaea: 'archaea',
      Fungi: 'fungi',
      Plantae: 'plants',
      Animalia: 'animals',
      Annelida: 'annelids',
      Echinodermata: 'echinoderms',
      Mollusca: 'mollusks',
      Porifera: 'sponges',
      Cnidaria: 'cnidarians',
      Platyhelminthes: 'platyhelminthes',
      Nematoda: 'nematodes',
      Arthropoda: 'arthropods',
      Reptilia: 'reptiles', // Define 'reptiles' as all of Reptilia excluding Aves -- Aves will match before this
      'Reptilia Laurenti, 1768': 'reptiles',
      Aves: 'birds',
      Mammalia: 'mammals',
      Lissamphibia: 'amphibians',
      Vertebrata: 'fishes' // Vertebrata that aren't fishes defined by exclusion -- see exclusionClades
    }
  , exclusionClades = {
      Tetrapoda: 'fishes' // All Vertebrata except those in Tetrapoda are fishes
    }
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
    , exclusionMatches = []
    ;

  if (taxon in specialCaseTaxa) {
    return specialCaseTaxa[taxon];
  }

  orderedAncestors = ancestors.slice(0).reverse();
  
  match = orderedAncestors.find((anc) => {
    var exclusionMatch
      , inclusionMatch
      ;

    if (!anc.scientificName) {
      return false;
    }

    exclusionMatch = exclusionClades[anc.scientificName];

    if (exclusionMatch) {
      exclusionMatches.push(exclusionMatch); 
      return false;
    }

    inclusionMatch = inclusionClades[anc.scientificName];

    if (inclusionMatch && !exclusionMatches.includes(inclusionMatch)) {
      return true;
    }
  });

  
  if (match) {
    result = inclusionClades[match.scientificName];
  }

  return result;
}

module.exports.taxonGroupKey = function(scientificName) {
  return inclusionClades[scientificName];
}

module.exports.taxonGroupKeys = function() {
  return taxonGroups;
}

function uniqueTaxonGroups() {
  var allGroups = [];

  Object.keys(inclusionClades).forEach((key) => {
    allGroups.push(inclusionClades[key]);
  });

  Object.keys(specialCaseTaxa).forEach((key) => {
    allGroups.push(specialCaseTaxa[key]);
  });

  return util.sortUniq(allGroups);
}

