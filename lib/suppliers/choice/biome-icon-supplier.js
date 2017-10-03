var urlHelper = require('_/url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    {
      label: 'Desert',
      url: urlHelper.staticImageUrl('biome_icons/desert.jpg'),
      choiceKey: 0
    },
    {
      label: 'Freshwater',
      url: urlHelper.staticImageUrl('biome_icons/freshwater.jpg'),
      choiceKey: 1
    },
    {
      label: 'Grasslands',
      url: urlHelper.staticImageUrl('biome_icons/grasslands.jpg'),
      choiceKey: 2
    },
    {
      label: 'Marine',
      url: urlHelper.staticImageUrl('biome_icons/marine.jpg'),
      choiceKey: 3
    },
    {
      label: 'Temperate Forest',
      url: urlHelper.staticImageUrl('biome_icons/temperate_forest.jpg'),
      choiceKey: 4
    },
    {
      label: 'Tropical Forest',
      url: urlHelper.staticImageUrl('biome_icons/tropical_forest.jpg'),
      choiceKey: 5
    },
    {
      label: 'Tundra',
      url: urlHelper.staticImageUrl('biome_icons/tundra.jpg'),
      choiceKey: 6
    },
    {
      label: 'Urban',
      url: urlHelper.staticImageUrl('biome_icons/urban.jpg'),
      choiceKey: 7 
    }
  ])
};
