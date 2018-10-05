var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale) {
  return Promise.resolve({
    choices: [
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.alpine'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.alpine'),
        url: urlHelper.staticImageUrl('biome_icons/alpine.png'),
        choiceKey: 0
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.chaparral'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.chaparral'),
        url: urlHelper.staticImageUrl('biome_icons/chaparral.png'),
        choiceKey: 1
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.coral_reef'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.coral_reef'),
        url: urlHelper.staticImageUrl('biome_icons/coral_reef.png'),
        choiceKey: 2
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.desert'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.desert'),
        url: urlHelper.staticImageUrl('biome_icons/desert.png'),
        choiceKey: 3
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.estuary'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.estuary'),
        url: urlHelper.staticImageUrl('biome_icons/estuary.png'),
        choiceKey: 4
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.freshwater'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.freshwater'),
        url: urlHelper.staticImageUrl('biome_icons/freshwater.png'),
        choiceKey: 5
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.grasslands'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.grasslands'),
        url: urlHelper.staticImageUrl('biome_icons/grasslands.png'),
        choiceKey: 6
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.marine'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.marine'),
        url: urlHelper.staticImageUrl('biome_icons/marine.png'),
        choiceKey: 7
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.multi'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.multi'),
        url: urlHelper.staticImageUrl('biome_icons/multi.png'),
        choiceKey: 8
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.taiga_forest'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.taiga_forest'),
        url: urlHelper.staticImageUrl('biome_icons/taiga_forest.png'),
        choiceKey: 9
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.temperate_forest'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.temperate_forest'),
        url: urlHelper.staticImageUrl('biome_icons/temperate_forest.png'),
        choiceKey: 10
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.tropical_rainforest'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.tropical_rainforest'),
        url: urlHelper.staticImageUrl('biome_icons/tropical_rainforest.png'),
        choiceKey: 11
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.tundra'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.tundra'),
        url: urlHelper.staticImageUrl('biome_icons/tundra.png'),
        choiceKey: 12
      },
      {
        label: i18n.t(locale, 'biomeIconSupplier.labels.urban'),
        text: i18n.t(locale, 'biomeIconSupplier.labels.urban'),
        url: urlHelper.staticImageUrl('biome_icons/urban.png'),
        choiceKey: 13
      }
    ]
  });
};

