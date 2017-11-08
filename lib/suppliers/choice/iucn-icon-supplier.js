var reqlib = require('app-root-path').reqlib;
var urlHelper = require('_/url-helper')
  , i18n = require('_/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.lc'),
      url: urlHelper.staticImageUrl('iucn_icons/LC.png'),
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.nt'),
      url: urlHelper.staticImageUrl('iucn_icons/NT.png'),
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.vu'),
      url: urlHelper.staticImageUrl('iucn_icons/VU.png'),
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.en'),
      url: urlHelper.staticImageUrl('iucn_icons/EN.png'),
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.cr'),
      url: urlHelper.staticImageUrl('iucn_icons/CR.png'),
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ew'),
      url: urlHelper.staticImageUrl('iucn_icons/EW.png'),
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ex'),
      url: urlHelper.staticImageUrl('iucn_icons/EX.png'),
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.dd'),
      url: urlHelper.staticImageUrl('iucn_icons/DD.png'),
      choiceKey: 7
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ne'),
      url: urlHelper.staticImageUrl('iucn_icons/NE.png'),
      choiceKey: 8
    }
  ]);
};
