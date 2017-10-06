var i18n = require('_/i18n');

var white = '#fff'
  , grey = '#454545'
  ;

module.exports.supply = function(params, apiResults, locale, cb) {
  cb(null, [
    { bg: "#a0e2ff", text: grey,  choiceKey: 0  },
    { bg: "#0e5df3", text: white, choiceKey: 1  },
    { bg: "#04d7b5", text: grey,  choiceKey: 2  },
    { bg: "#199cff", text: white, choiceKey: 3  },
    { bg: "#84ff4e", text: grey,  choiceKey: 4  },
    { bg: "#42d818", text: grey,  choiceKey: 5  },
    { bg: "#9dbe00", text: grey,  choiceKey: 6  },
    { bg: "#4ba200", text: white, choiceKey: 7  },
    { bg: "#a88137", text: white, choiceKey: 8  },
    { bg: "#7e510e", text: white, choiceKey: 9  },
    { bg: "#ff6b0b", text: white, choiceKey: 10 },
    { bg: "#d61010", text: white, choiceKey: 11 },
    { bg: "#ffe100", text: grey,  choiceKey: 12 },
    { bg: "#ffb20a", text: grey,  choiceKey: 13 },
    { bg: "#ff869b", text: white, choiceKey: 14 },
    { bg: "#f600ff", text: white, choiceKey: 15 },
    { bg: "#f7a2ff", text: grey,  choiceKey: 16 },
    { bg: "#a000db", text: white, choiceKey: 17 },
    { bg: "#c8c8c8", text: grey,  choiceKey: 18 },
    { bg: "#818080", text: white, choiceKey: 19 },
    { bg: "#fff",    text: grey,  choiceKey: 20 },
    { bg: "#000",    text: white, choiceKey: 21 }
  ], [
    i18n.t(locale, 'standardBgColorSupplier.tips.annelids'),
    i18n.t(locale, 'standardBgColorSupplier.tips.bacteria'),
    i18n.t(locale, 'standardBgColorSupplier.tips.echinoderms'),
    i18n.t(locale, 'standardBgColorSupplier.tips.fishes'),
    i18n.t(locale, 'standardBgColorSupplier.tips.archaea'),
    i18n.t(locale, 'standardBgColorSupplier.tips.platyhelminthes'),
    i18n.t(locale, 'standardBgColorSupplier.tips.mollusks'),
    i18n.t(locale, 'standardBgColorSupplier.tips.plants'),
    i18n.t(locale, 'standardBgColorSupplier.tips.fungi'),
    i18n.t(locale, 'standardBgColorSupplier.tips.nematodes'),
    i18n.t(locale, 'standardBgColorSupplier.tips.reptiles'),
    i18n.t(locale, 'standardBgColorSupplier.tips.arthropods'),
    i18n.t(locale, 'standardBgColorSupplier.tips.birds'),
    i18n.t(locale, 'standardBgColorSupplier.tips.cnidarians'),
    i18n.t(locale, 'standardBgColorSupplier.tips.amphibians'),
    i18n.t(locale, 'standardBgColorSupplier.tips.protists'),
    i18n.t(locale, 'standardBgColorSupplier.tips.sponges'),
    i18n.t(locale, 'standardBgColorSupplier.tips.mammals'),
    null,
    i18n.t(locale, 'standardBgColorSupplier.tips.otherAnimals')
  ]);
}
