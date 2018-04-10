var reqlib = require('app-root-path').require
  , i18n = reqlib('lib/i18n')
  ;

module.exports.supply = function(params, data, locale, cb) {
  cb(null, [
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.lc'),
      choiceKey: 0,
      bgColor: "#0b5453"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.nt'),
      choiceKey: 1,
      bgColor: "#0b5453"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.vu'),
      choiceKey: 2,
      bgColor: "#c89523"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.en'),
      choiceKey: 3,
      bgColor: "#c86a17"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.cr'),
      choiceKey: 4,
      bgColor: "#ce2311"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ew'),
      choiceKey: 5,
      bgColor: "#000"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ex'),
      choiceKey: 6,
      bgColor: "#000"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.dd'),
      choiceKey: 7,
      bgColor: "#4f4379"
    },
    {
      label: i18n.t(locale, 'template.fieldLabels.iucnStatus'),
      text: i18n.t(locale, 'iucnIconSupplier.icons.ne'),
      choiceKey: 8,
      bgColor: "#2a669b"
    }
  ]);
};
