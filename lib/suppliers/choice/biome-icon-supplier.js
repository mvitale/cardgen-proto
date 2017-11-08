var urlHelper = require('_/url-helper')
  , i18n = require('_/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.desert'),
      url: urlHelper.staticImageUrl('biome_icons/desert.jpg'),
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.freshwater'),
      url: urlHelper.staticImageUrl('biome_icons/freshwater.jpg'),
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.grasslands'),
      url: urlHelper.staticImageUrl('biome_icons/grasslands.jpg'),
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.marine'),
      url: urlHelper.staticImageUrl('biome_icons/marine.jpg'),
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.temperateForest'),
      url: urlHelper.staticImageUrl('biome_icons/temperate_forest.jpg'),
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.tropicalForest'),
      url: urlHelper.staticImageUrl('biome_icons/tropical_forest.jpg'),
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.tundra'),
      url: urlHelper.staticImageUrl('biome_icons/tundra.jpg'),
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.urban'),
      url: urlHelper.staticImageUrl('biome_icons/urban.jpg'),
      choiceKey: 7
    }
  ])
};
