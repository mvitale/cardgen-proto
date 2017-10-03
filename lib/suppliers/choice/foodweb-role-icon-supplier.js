var urlHelper = require('_/url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    {
      label: 'Apex predator',
      url: urlHelper.staticImageUrl('foodweb_icons/APEX.png'),
      choiceKey: 0
    },
    {
      label: 'Autotroph',
      url: urlHelper.staticImageUrl('foodweb_icons/AUTO.png'),
      choiceKey: 1
    },
    {
      label: 'Carnivore',
      url: urlHelper.staticImageUrl('foodweb_icons/CARN.png'),
      choiceKey: 2
    },
    {
      label: 'Decomposer',
      url: urlHelper.staticImageUrl('foodweb_icons/DECO.png'),
      choiceKey: 3
    },
    {
      label: 'Detritivore',
      url: urlHelper.staticImageUrl('foodweb_icons/DETR.png'),
      choiceKey: 4
    },
    {
      label: 'Herbivore',
      url: urlHelper.staticImageUrl('foodweb_icons/HERB.png'),
      choiceKey: 5
    },
    {
      label: 'Omnivore',
      url: urlHelper.staticImageUrl('foodweb_icons/OMNI.png'),
      choiceKey: 6
    },
    {
      label: 'Sanguinivore',
      url: urlHelper.staticImageUrl('foodweb_icons/SANG.png'),
      choiceKey: 7
    }
  ]);
}
