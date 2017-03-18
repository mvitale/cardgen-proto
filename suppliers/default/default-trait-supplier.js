var util = require('./util/util')

var classToTraitNames = {
  'Mammalia': [
    'Adult Body Length',
    'Adult Weight',
    'Lifespan',
    'Offspring/Litters',
    'Age of Female Maturity'
  ],
  'Aves': [
    'Wingspan',
    'Adult Weight',
    'Lifespan',
    'Clutch/Broods',
    'Nest Type'
  ],
  'Reptilia': [
    'Snout-vent Length',
    'Adult Weight',
    'Adult Habitat',
    'Clutch/Broods',
    'Activity'
  ],
  'Amphibia': [
    'Snout-vent Length',
    'Adult Weight',
    'Adult Habitat',
    'Clutch/Broods',
    'Activity'
  ]
};

module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var classLatinName = util.extractClassName(apiResults)
    , traitNames = classLatinName && classToTraitNames[classLatinName] ?
                   classToTraitNames[classLatinName] :
                   []
    , traitData = traitNames.map((traitName) => {
                    return { trait: { key: traitName, val: 'Value...' } };
                  })
    ;

  cb(null, traitData);
}
