var reqlib = require('app-root-path').require;
var i18n = reqlib('lib/i18n')
  , urlHelper = reqlib('lib/url-helper')
  ;

var white = '#fff'
  , grey = '#454545'
  ;

var choices = [
  { bg: "#ff9db5", text: grey,  choiceKey: 'amphibians'      },
  { bg: "#a248d9", text: white, choiceKey: 'mammals'         },
  { bg: "#c54848", text: white, choiceKey: 'animals'         },
  { bg: "#ce61cb", text: white, choiceKey: 'mollusks'        },
  { bg: "#d19f60", text: grey,  choiceKey: 'archaea'         },
  { bg: "#ffccf5", text: grey,  choiceKey: 'nematodes'       },
  { bg: "#8e522c", text: white, choiceKey: 'annelids'        },
  { bg: "#92cc66", text: grey,  choiceKey: 'plants'          },
  { bg: "#ea8529", text: white, choiceKey: 'arthropods'      },
  { bg: "#cbe44e", text: grey,  choiceKey: 'platyhelminthes' },
  { bg: "#ffc540", text: grey,  choiceKey: 'bacteria'        },
  { bg: "#678d46", text: white, choiceKey: 'protists'        },
  { bg: "#fffa4e", text: grey,  choiceKey: 'birds'           },
  { bg: "#49abd0", text: white, choiceKey: 'reptiles'        },
  { bg: "#d3fa8e", text: grey,  choiceKey: 'cnidarians'      },
  { bg: "#85c4e1", text: grey,  choiceKey: 'sponges'         },
  { bg: "#96ddd0", text: grey,  choiceKey: 'echinoderms'     },
  { bg: "#ffffff", text: grey,  choiceKey: '*misc2'          },
  { bg: "#5267ee", text: white, choiceKey: 'fishes'          },
  { bg: "#97a0a7", text: white, choiceKey: '*misc1'          },
  { bg: "#798088", text: white, choiceKey: 'fungi'           },
  { bg: "#292929", text: white, choiceKey: '*misc3'          }
].map((choice) => {
  var filename;

  if (choice.text === grey) {
    filename = 'eol_logo_black.png';
  } else {
    filename = 'eol_logo_white.png';
  }

  choice.eolLogoUrl = urlHelper.staticImageUrl('logos/' + filename);
  return choice;
});

module.exports.supply = function(params, data, locale, cb) {
  cb(null, choices, choices.map(choice => {
    var text = null;

    if (!choice.choiceKey.startsWith('*')) {
      text = i18n.t(locale, 'taxa.' + choice.choiceKey);
    }

    return text;
  }));
}
