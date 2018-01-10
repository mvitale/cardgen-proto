var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.apexPredator'),
      url: urlHelper.staticImageUrl('foodweb_icons/BLANK.png'),
      text: 'APEX',
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.autotroph'),
      url: urlHelper.staticImageUrl('foodweb_icons/AUTO.png'),
      text: '',
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.carnivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/CARN.png'),
      text: '',
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.decomposer'),
      url: urlHelper.staticImageUrl('foodweb_icons/DECO.png'),
      text: '',
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.detritivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/DETR.png'),
      text: '',
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.herbivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/HERB.png'),
      text: '',
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.omnivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/OMNI.png'),
      text: '',
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.labels.sanguinivore'),
      url: urlHelper.staticImageUrl('foodweb_icons/SANG.png'),
      text: '',
      choiceKey: 7
    }
  ]);
}
