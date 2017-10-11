var urlHelper = require('_/url-helper')
  , i18n = require('_/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.apexPredator'),
      url: urlHelper.staticImageUrl('foodweb_icons/APEX.png'),
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.autotroph'),
      url: urlHelper.staticImageUrl('foodweb_icons/AUTO.png'),
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.carnivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/CARN.png'),
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.decomposer'),
      url: urlHelper.staticImageUrl('foodweb_icons/DECO.png'),
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.detritivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/DETR.png'),
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.herbivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/HERB.png'),
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.omnivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/OMNI.png'),
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.sanguinivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/SANG.png'),
      choiceKey: 7
    }
  ]);
}
