var roles = [
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.apexPredator',
    textKey: 'foodwebRoleIconSupplier.icons.apex',
    bgColor: '#398fd7',
    choiceKey: 0
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.autotroph',
    textKey: 'foodwebRoleIconSupplier.icons.auto',
    bgColor: '#fdb82a',
    choiceKey: 1
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.carnivore',
    textKey: 'foodwebRoleIconSupplier.icons.carn',
    bgColor: '#fc3f26',
    choiceKey: 2
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.decomposer',
    textKey: 'foodwebRoleIconSupplier.icons.deco',
    bgColor: '#6d4528',
    choiceKey: 3
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.detritivore',
    textKey: 'foodwebRoleIconSupplier.icons.detr',
    bgColor: '#868686',
    choiceKey: 4
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.herbivore',
    textKey: 'foodwebRoleIconSupplier.icons.herb',
    bgColor: '#619445',
    choiceKey: 5
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.heterotroph',
    textKey: 'foodwebRoleIconSupplier.icons.hete',
    bgColor: '#a87646',
    choiceKey: 9
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.multiple',
    textKey: 'foodwebRoleIconSupplier.icons.mult',
    bgColor: '#51c9a9',
    choiceKey: 8
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.omnivore',
    textKey: 'foodwebRoleIconSupplier.icons.omni',
    bgColor: '#f17d16',
    choiceKey: 6
  },
  {
    labelKey: 'foodwebRoleIconSupplier.label',
    menuLabelKey: 'foodwebRoleIconSupplier.labels.sanguinivore',
    textKey: 'foodwebRoleIconSupplier.icons.sang',
    bgColor: '#e2335e',
    choiceKey: 7
  }
];

module.exports.items = function() {
  return JSON.parse(JSON.stringify(roles));
}

