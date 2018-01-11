var reqlib = require('app-root-path').require;
var i18n = reqlib('lib/i18n');

var white = '#fff'
  , grey = '#454545'
  ;

var taxonGroupKeyTransforms = {
  'animals': 'otherAnimals'
};

module.exports.supply = function(params, data, locale, cb) {
  var choices = [
    { bg: "#c1eafd", text: grey,  choiceKey: 'annelids'        },
    { bg: "#5267ee", text: white, choiceKey: 'bacteria'        },
    { bg: "#74ecd5", text: grey,  choiceKey: 'echinoderms'     },
    { bg: "#46a3c7", text: white, choiceKey: 'fishes'          },
    { bg: "#d3fa8e", text: grey,  choiceKey: 'archaea'         },
    { bg: "#70a945", text: white,  choiceKey: 'platyhelminthes' },
    { bg: "#bfdc2f", text: grey,  choiceKey: 'mollusks'        },
    { bg: "#577e35", text: white, choiceKey: 'plants'          },
    { bg: "#ba903e", text: white, choiceKey: 'fungi'           },
    { bg: "#8e522c", text: white, choiceKey: 'nematodes'       },
    { bg: "#f1831d", text: white, choiceKey: 'reptiles'        },
    { bg: "#b64747", text: white, choiceKey: 'arthropods'      },
    { bg: "#fffa4e", text: grey,  choiceKey: 'birds'           },
    { bg: "#f7b92a", text: grey,  choiceKey: 'cnidarians'      },
    { bg: "#f68888", text: white, choiceKey: 'amphibians'      },
    { bg: "#ce61cb", text: white, choiceKey: 'protists'        },
    { bg: "#fcb1ff", text: grey,  choiceKey: 'sponges'         },
    { bg: "#9045bd", text: white, choiceKey: 'mammals'         },
    { bg: "#c0c9d0", text: grey,  choiceKey: '*misc1'          },
    { bg: "#798088", text: white, choiceKey: 'animals'         },
    { bg: "#fff",    text: grey,  choiceKey: '*misc2'          },
    { bg: "#242424", text: white, choiceKey: '*misc3'          }
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
