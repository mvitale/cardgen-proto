var reqlib = require('app-root-path').require;
var urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.lc'),
      url: urlHelper.staticImageUrl('iucn_icons/BLANK.png'),
      text: 'LC',
      choiceKey: 0
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.nt'),
      url: urlHelper.staticImageUrl('iucn_icons/NT.png'),
      text: '',
      choiceKey: 1
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.vu'),
      url: urlHelper.staticImageUrl('iucn_icons/VU.png'),
      text: '',
      choiceKey: 2
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.en'),
      url: urlHelper.staticImageUrl('iucn_icons/EN.png'),
      text: '',
      choiceKey: 3
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.cr'),
      url: urlHelper.staticImageUrl('iucn_icons/CR.png'),
      text: '',
      choiceKey: 4
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ew'),
      url: urlHelper.staticImageUrl('iucn_icons/EW.png'),
      text: '',
      choiceKey: 5
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ex'),
      url: urlHelper.staticImageUrl('iucn_icons/EX.png'),
      text: '',
      choiceKey: 6
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.dd'),
      url: urlHelper.staticImageUrl('iucn_icons/DD.png'),
      text: '',
      choiceKey: 7
    },
    {
      label: i18n.t(locale, 'iucnIconSupplier.labels.ne'),
      url: urlHelper.staticImageUrl('iucn_icons/NE.png'),
      text: '',
      choiceKey: 8
    }
  ]);
};