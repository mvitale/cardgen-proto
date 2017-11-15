var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.desert'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/desert.jpg'),
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.freshwater'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/freshwater.jpg'),
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.grasslands'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/grasslands.jpg'),
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.marine'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/marine.jpg'),
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.temperateForest'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/temperate_forest.jpg'),
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.tropicalForest'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/tropical_forest.jpg'),
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.tundra'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/tundra.jpg'),
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'biomeIconSupplier.labels.urban'),
      text: 'test biome',
      url: urlHelper.staticImageUrl('biome_icons/urban.jpg'),
      choiceKey: 7
    }
  ])
};
