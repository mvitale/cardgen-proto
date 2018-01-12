var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.apexPredator'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.apex'),
      url: urlHelper.staticImageUrl('foodweb_icons/apex.png'),
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.autotroph'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.auto'),
      url: urlHelper.staticImageUrl('foodweb_icons/AUTO.png'),
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.carnivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.carn'),
      url: urlHelper.staticImageUrl('foodweb_icons/CARN.png'),
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.decomposer'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.deco'),
      url: urlHelper.staticImageUrl('foodweb_icons/DECO.png'),
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.detritivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.detr'),
      url: urlHelper.staticImageUrl('foodweb_icons/DETR.png'),
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.herbivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.herb'),
      url: urlHelper.staticImageUrl('foodweb_icons/HERB.png'),
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.omnivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.omni'),
      url: urlHelper.staticImageUrl('foodweb_icons/OMNI.png'),
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.sanguinivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.sang'),
      url: urlHelper.staticImageUrl('foodweb_icons/SANG.png'),
      choiceKey: 7
    }
  ]);
}
