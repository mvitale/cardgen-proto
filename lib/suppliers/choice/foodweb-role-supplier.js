var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.apexPredator'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.apex'),
      bgColor: '#398fd7',
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.autotroph'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.auto'),
      bgColor: '#fdb82a',
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.carnivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.carn'),
      bgColor: '#fc3f26',
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.decomposer'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.deco'),
      bgColor: '#6d4528',
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.detritivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.detr'),
      bgColor: '#868686',
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.herbivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.herb'),
      bgColor: '#619445',
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.heterotroph'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.hete'),
      bgColor: '#a87646',
      choiceKey: 9
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.multiple'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.mult'),
      bgColor: '#51c9a9',
      choiceKey: 8
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.omnivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.omni'),
      bgColor: '#f17d16',
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'foodwebRoleIconSupplier.label'),
      menuLabel: i18n.t(locale, 'foodwebRoleIconSupplier.labels.sanguinivore'),
      text: i18n.t(locale, 'foodwebRoleIconSupplier.icons.sang'),
      bgColor: '#e2335e',
      choiceKey: 7
    }
  ]);
}
