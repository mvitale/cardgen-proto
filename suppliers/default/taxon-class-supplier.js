
var classToGroup = {
  'Magnoliopsida': 'Flowering Plants',
  'Aves': 'Birds',
  'Mammalia': 'Mammals',
  'Annelida': 'Worms',
  'Arthropoda': 'Arthropods',
  'Crustacea': 'Crustaceans',
  'Arachnida': 'Arachnids',
  'Insecta': 'Insects',
  'Actinopterygii': 'Ray-finned Fishes',
  'Mollusca': 'Mollusks',
  'Amphibia': 'Amphibians',
  'Reptilia': 'Reptiles'
}



module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var ancestors = apiResults.hierarchy_entries.ancestors
    , classLevelResults = ancestors.filter((result) => {
        return result.taxonRank === 'class'
      })
    , result = ""
    ;

  if (classLevelResults.length) {
    result = classLevelResults[0].scientificName;
  }

  result = classToGroup[result] ? classToGroup[result] : result;

  cb(null, result);
}
