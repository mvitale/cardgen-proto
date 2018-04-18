var reqlib = require('app-root-path').require
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.lc'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.lc'),
      choiceKey: 0,
      bgColor: "#0b5453"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.nt'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.nt'),
      choiceKey: 1,
      bgColor: "#0b5453"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.vu'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.vu'),
      choiceKey: 2,
      bgColor: "#c89523"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.en'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.en'),
      choiceKey: 3,
      bgColor: "#c86a17"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.cr'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.cr'),
      choiceKey: 4,
      bgColor: "#ce2311"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ew'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.ew'),
      choiceKey: 5,
      bgColor: "#000"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ex'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.ex'),
      choiceKey: 6,
      bgColor: "#000"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.dd'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.dd'),
      choiceKey: 7,
      bgColor: "#4f4379"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ne'),
      menuLabel: i18n.t(locale, 'iucnIconSupplier.labels.ne'),
      choiceKey: 8,
      bgColor: "#2a669b"
    }
  ]);
};
