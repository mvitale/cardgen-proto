var util = require('./util/util');

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



module.exports.supply = function(params, apiResults, choices, cb) {
  var classLatinName = util.extractClassName(apiResults)
    , result = classLatinName && classToGroup[classLatinName] ?
           classToGroup[classLatinName] :
           ''
    ;

  cb(null, { text: result });
}
