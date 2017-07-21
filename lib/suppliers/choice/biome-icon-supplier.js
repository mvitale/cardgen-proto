var urlHelper = require('_/url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    { label: 'Desert', url: urlHelper.staticImageUrl('biome_icons/desert.jpg') },
    { label: 'Freshwater', url: urlHelper.staticImageUrl('biome_icons/freshwater.jpg') },
    { label: 'Grasslands', url: urlHelper.staticImageUrl('biome_icons/grasslands.jpg') },
    { label: 'Marine', url: urlHelper.staticImageUrl('biome_icons/marine.jpg') },
    { label: 'Temperate Forest', url: urlHelper.staticImageUrl('biome_icons/temperate_forest.jpg') },
    { label: 'Tropical Forest', url: urlHelper.staticImageUrl('biome_icons/tropical_forest.jpg') },
    { label: 'Tundra', url: urlHelper.staticImageUrl('biome_icons/tundra.jpg') },
    { label: 'Urban', url: urlHelper.staticImageUrl('biome_icons/urban.jpg') }
  ])
};
