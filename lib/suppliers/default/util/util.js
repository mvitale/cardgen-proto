module.exports.extractClassName = function(apiResults) {
  var ancestors = apiResults.hierarchy_entries.ancestors
    , classLevelResults
    , result = ''
    ;

  if (ancestors) {
    classLevelResults = ancestors.filter((result) => {
      return result.taxonRank === 'class';
    });

    if (classLevelResults.length && classLevelResults[0].scientificName) {
      result = classLevelResults[0].scientificName;
    }
  }

  return result;
}

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
    Nematoda: 'Nematodes'
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
    Myxini: 'Fishes'
  }
};

var taxonRankOrder = ['class', 'phylum', 'kingdom'];

module.exports.hierarchyDisplayName = function(apiResults) {
  var ancestors = apiResults.hierarchy_entries.ancestors
    , taxonRankResult
    , sciName
    , taxonRank
    , taxonRankMapping
    , result = null
    ;

  console.log(ancestors);

  for (var i = 0; i < taxonRankOrder.length && result === null; i++) {
    taxonRank = taxonRankOrder[i];
    taxonRankMapping = hierarchyMappings[taxonRank];

    taxonRankResult = ancestors.filter((result) => {
      return result.taxonRank === taxonRank;
    });

    if (taxonRankResult.length && taxonRankResult[0].scientificName) {
      sciName = taxonRankResult[0].scientificName;

      if (sciName in taxonRankMapping) {
        result = taxonRankMapping[sciName];
      }
    }
  }

  return result;
}
