var i18n = require('_/i18n');

var white = '#fff'
  , grey = '#454545'
  ;

var taxonGroupKeyTransforms = {
  'animals': 'otherAnimals'
};

module.exports.supply = function(params, data, locale, cb) {
  var choices = [
    { bg: "#a0e2ff", text: grey,  choiceKey: 'annelids'        },
    { bg: "#0e5df3", text: white, choiceKey: 'bacteria'        },
    { bg: "#04d7b5", text: grey,  choiceKey: 'echinoderms'     },
    { bg: "#199cff", text: white, choiceKey: 'fishes'          },
    { bg: "#84ff4e", text: grey,  choiceKey: 'archaea'         },
    { bg: "#42d818", text: grey,  choiceKey: 'platyhelminthes' },
    { bg: "#9dbe00", text: grey,  choiceKey: 'mollusks'        },
    { bg: "#4ba200", text: white, choiceKey: 'plants'          },
    { bg: "#a88137", text: white, choiceKey: 'fungi'           },
    { bg: "#7e510e", text: white, choiceKey: 'nematodes'       },
    { bg: "#ff6b0b", text: white, choiceKey: 'reptiles'        },
    { bg: "#d61010", text: white, choiceKey: 'arthropods'      },
    { bg: "#ffe100", text: grey,  choiceKey: 'birds'           },
    { bg: "#ffb20a", text: grey,  choiceKey: 'cnidarians'      },
    { bg: "#ff869b", text: white, choiceKey: 'amphibians'      },
    { bg: "#f600ff", text: white, choiceKey: 'protists'        },
    { bg: "#f7a2ff", text: grey,  choiceKey: 'sponges'         },
    { bg: "#a000db", text: white, choiceKey: 'mammals'         },
    { bg: "#c8c8c8", text: grey,  choiceKey: '*misc1'          },
    { bg: "#818080", text: white, choiceKey: 'animals'         },
    { bg: "#fff",    text: grey,  choiceKey: '*misc2'          },
    { bg: "#000",    text: white, choiceKey: '*misc3'          }
  ];

  cb(null, choices, choices.map(choice => {
    var text = null;

    if (!choice.choiceKey.startsWith('*')) {
      text = i18n.t(locale, 'taxa.' +
        (taxonGroupKeyTransforms[choice.choiceKey] || choice.choiceKey));
    }

    return text;
  }));
}
