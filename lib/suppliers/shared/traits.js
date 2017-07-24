var util = require('_/suppliers/shared/util');

var taxonGroupTraits = {
      'Annelids': [
        'Body Length',
        'Development',
        'Lifespan',
        'Number of Eggs',
        'Activity'
      ],
      'Bacteria': [
        'Length',
        'Cell Shape',
        'Habitat',
        'Metabolism',
        'Reproduction'
      ],
      'Echinoderms': [
        'Size',
        'Color',
        'Lifespan',
        'Reproduction',
        'Zonation'
      ],
      'Fishes': [
        'Body Length',
        'Adult Weight',
        'Lifespan',
        'Number of Eggs',
        'Nest Type'
      ],
      'Archaea': [
        'Diameter',
        'Cell Shape',
        'Habitat',
        'Metabolism',
        'Cell Wall'
      ],
      'Platyhelminthes': [
        'Total Length',
        'Number of Eggs',
        'Lifespan',
        'Habitat',
        'Symbiotic Status'
      ],
      'Mollusks': [
        'Body Length',
        'Shell/mantle',
        'Lifespan',
        'Number of Eggs',
        'Activity'
      ],
      'Plants': [
        'Height',
        'Growth Form',
        'Life Cycle',
        'Flower Color',
        'Sunlight/soil'
      ],
      'Fungi': [
        'Cap Size',
        'Growth Habit',
        'Spore Surface',
        'Cap Color',
        'Spore Print'
      ],
      'Nematodes': [
        'Total Length',
        'Reproduction',
        'Number of Eggs',
        'Habitat',
        'Symbiotic Status'
      ],
      'Reptiles': [
        'Total Length',
        'Adult Weight',
        'Adult Habitat',
        'Clutch/broods',
        'Activity'
      ],
      'Arthropods': [
        'Adult Body Length',
        'Development',
        'Adult Lifespan',
        'Number of Eggs',
        'Wings'
      ],
      'Birds': [
        'Wingspan',
        'Adult Weight',
        'Lifespan',
        'Clutch/broods',
        'Nest Type'
      ],
      'Cnidarians': [
        'Body Length',
        'Form',
        'Lifespan',
        'Reproduction',
        'Depth Zone'
      ],
      'Amphibians': [
        'Snout-vent Length',
        'Adult Habitat',
        'Development',
        'Clutch/broods',
        'Activity'
      ],
      'Protists': [
        'Organism Cells',
        'Cell Shape',
        'Life Cycle',
        'Motility',
        'Reproduction'
      ],
      'Sponges': [
        'Height',
        'Energy Source',
        'Host',
        'Reproduction',
        'Habitat'
      ],
      'Mammals': [
        'Adult Body Length',
        'Adult Weight',
        'Lifespan',
        'Offspring/litters',
        'Age of Female Maturity'
      ],
      'Animals': [
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
