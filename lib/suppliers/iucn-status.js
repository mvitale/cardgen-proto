var statuses = [
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.lc',
    menuLabelKey: 'iucnIconSupplier.labels.lc',
    choiceKey: 0,
    bgColor: "#0b5453"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.nt',
    menuLabelKey: 'iucnIconSupplier.labels.nt',
    choiceKey: 1,
    bgColor: "#0b5453"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.vu',
    menuLabelKey: 'iucnIconSupplier.labels.vu',
    choiceKey: 2,
    bgColor: "#c89523"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.en',
    menuLabelKey: 'iucnIconSupplier.labels.en',
    choiceKey: 3,
    bgColor: "#c86a17"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.cr',
    menuLabelKey: 'iucnIconSupplier.labels.cr',
    choiceKey: 4,
    bgColor: "#ce2311"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.ew',
    menuLabelKey: 'iucnIconSupplier.labels.ew',
    choiceKey: 5,
    bgColor: "#000"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.ex',
    menuLabelKey: 'iucnIconSupplier.labels.ex',
    choiceKey: 6,
    bgColor: "#000"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.dd',
    menuLabelKey: 'iucnIconSupplier.labels.dd',
    choiceKey: 7,
    bgColor: "#4f4379"
  },
  {
    labelKey: 'iucnIconSupplier.label',
    textKey: 'iucnIconSupplier.icons.ne',
    menuLabelKey: 'iucnIconSupplier.labels.ne',
    choiceKey: 8,
    bgColor: "#2a669b"
  }
];

module.exports.items = function() {
  return JSON.parse(JSON.stringify(statuses));
}

