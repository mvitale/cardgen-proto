var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.lc'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.lc'),
      url: urlHelper.staticImageUrl('iucn_icons/LC.png'),
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.nt'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.nt'),
      url: urlHelper.staticImageUrl('iucn_icons/NT.png'),
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.vu'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.vu'),
      url: urlHelper.staticImageUrl('iucn_icons/VU.png'),
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.en'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.en'),
      url: urlHelper.staticImageUrl('iucn_icons/EN.png'),
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.cr'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.cr'),
      url: urlHelper.staticImageUrl('iucn_icons/CR.png'),
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ew'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ew'),
      url: urlHelper.staticImageUrl('iucn_icons/EW.png'),
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ex'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ex'),
      url: urlHelper.staticImageUrl('iucn_icons/EX.png'),
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.dd'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.dd'),
      url: urlHelper.staticImageUrl('iucn_icons/DD.png'),
      choiceKey: 7
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ne'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ne'),
      url: urlHelper.staticImageUrl('iucn_icons/NE.png'),
      choiceKey: 8
    }
  ]);
};
