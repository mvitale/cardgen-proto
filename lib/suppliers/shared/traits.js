var reqlib = require('app-root-path').reqlib;
var util = require('_/suppliers/shared/util');

var taxonGroupTraits = {
      'annelids': [
        'Body Length',
        'Development',
        'Lifespan',
        'Number of Eggs',
        'Activity'
      ],
      'bacteria': [
        'Length',
        'Shape',
        'Locomotion',
        'Metabolism',
        'Reproduction'
      ],
      'echinoderms': [
        'Size',
        'Color',
        'Lifespan',
        'Reproduction',
        'Zonation'
      ],
      'fishes': [
        'Body Length',
        'Adult Weight',
        'Lifespan',
        'Number of Eggs',
        'Nest Type'
      ],
      'archaea': [
        'Diameter',
        'Cell Shape',
        'Habitat',
        'Metabolism',
        'Cell Wall'
      ],
      'platyhelminthes': [
        'Total Length',
        'Number of Eggs',
        'Lifespan',
        'Habitat',
        'Symbiotic Status'
      ],
      'mollusks': [
        'Body Length',
        'Shell/mantle',
        'Lifespan',
        'Number of Eggs',
        'Activity'
      ],
      'plants': [
        'Height',
        'Growth Form',
        'Life Cycle',
        'Flower Color',
        'Sunlight/soil'
      ],
      'fungi': [
        'Cap Size',
        'Growth Habit',
        'Spore Surface',
        'Cap Color',
        'Spore Print'
      ],
      'nematodes': [
        'Total Length',
        'Reproduction',
        'Number of Eggs',
        'Habitat',
        'Symbiotic Status'
      ],
      'reptiles': [
        'Total Length',
        'Adult Weight',
        'Adult Habitat',
        'Clutch/broods',
        'Activity'
      ],
      'arthropods': [
        'Adult Body Length',
        'Development',
        'Adult Lifespan',
        'Number of Eggs',
        'Wings'
      ],
      'birds': [
        'Wingspan',
        'Adult Weight',
        'Lifespan',
        'Clutch/broods',
        'Nest Type'
      ],
      'cnidarians': [
        'Body Length',
        'Form',
        'Lifespan',
        'Reproduction',
        'Depth Zone'
      ],
      'amphibians': [
        'Snout-vent Length',
        'Adult Habitat',
        'Development',
        'Clutch/broods',
        'Activity'
      ],
      'protists': [
        'Organism Cells',
        'Cell Shape',
        'Life Cycle',
        'Motility',
        'Reproduction'
      ],
      'sponges': [
        'Height',
        'Energy Source',
        'Host',
        'Reproduction',
        'Habitat'
      ],
      'mammals': [
        'Adult Body Length',
        'Adult Weight',
        'Lifespan',
        'Offspring/litters',
        'Age of Female Maturity'
      ],
      'animals': [
        'Body Length',
        'Adult Weight',
        'Lifespan',
        'Offspring',
        'Habitat'
      ]
    }
  , allTraits = util.uniqueValues(taxonGroupTraits)
  ;

module.exports.allTraits = function() {
  return allTraits;
}

module.exports.traitsForTaxonGroup = function(taxonGroup) {
  return taxonGroupTraits[taxonGroup] || [];
}
