var reqlib = require('app-root-path').require
  , urlHelper = reqlib('lib/url-helper')
  ;

var white = '#fff'
  , black = '#000'
  ;

var choices = [
      { bg: "#ff9db5", text: black, choiceKey: 'amphibians'      },
      { bg: "#a248d9", text: white, choiceKey: 'mammals'         },
      { bg: "#c54848", text: white, choiceKey: 'animals'         },
      { bg: "#ce61cb", text: white, choiceKey: 'mollusks'        },
      { bg: "#d19f60", text: black, choiceKey: 'archaea'         },
      { bg: "#ffccf5", text: black, choiceKey: 'nematodes'       },
      { bg: "#8e522c", text: white, choiceKey: 'annelids'        },
      { bg: "#92cc66", text: black, choiceKey: 'plants'          },
      { bg: "#ea8529", text: white, choiceKey: 'arthropods'      },
      { bg: "#cbe44e", text: black, choiceKey: 'platyhelminthes' },
      { bg: "#ffc540", text: black, choiceKey: 'bacteria'        },
      { bg: "#678d46", text: white, choiceKey: 'protists'        },
      { bg: "#fffa4e", text: black, choiceKey: 'birds'           },
      { bg: "#49abd0", text: white, choiceKey: 'reptiles'        },
      { bg: "#d3fa8e", text: black, choiceKey: 'cnidarians'      },
      { bg: "#85c4e1", text: black, choiceKey: 'sponges'         },
      { bg: "#96ddd0", text: black, choiceKey: 'echinoderms'     },
      { bg: "#ffffff", text: black, choiceKey: '*misc2'          },
      { bg: "#5267ee", text: white, choiceKey: 'fishes'          },
      { bg: "#97a0a7", text: white, choiceKey: '*misc1'          },
      { bg: "#798088", text: white, choiceKey: 'fungi'           },
      { bg: "#292929", text: white, choiceKey: '*misc3', safeSpaceLineColor: "#798088" }
    ].map((choice) => {
      var filename = choice.text === black ? 
            'eol_logo_black.png' :
            'eol_logo_white.png'
        ;

      choice.eolLogoUrl = urlHelper.staticImageUrl('logos/' + filename);
      choice.safeSpaceLineColor = choice.safeSpaceLineColor || black;

      return choice;
    })
  ;

module.exports.choices = function() {
  return JSON.parse(JSON.stringify(choices));
}

