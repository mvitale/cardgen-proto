var reqlib = require('app-root-path').require;
var fs = require('fs')
  , path = require('path')
  , Card = reqlib('lib/models/card')
  , speciesDataSupplier = reqlib('lib/suppliers/data/species-data-supplier')
  ;

var taxonId = 327940;
module.exports.taxonId = taxonId;

function getCard() {
  var data = readApiData();

  speciesDataSupplier._setApiCaller({
    getJson: function(apiName, params, log) {
      return new Promise((resolve, reject) => {
        var result;

        if (apiName === 'pages') {
          result = data.pages;
        } else if (apiName === 'hierarchy_entries') {
          result = data.hierarchyEntries;
        }

        if (!result) return reject(new Error('Unexpected api name in fake api caller: ' + apiName));
        return resolve(result)
      });
    }
  });

  var card = Card.new({
    templateName: 'trait',
    templateParams: {
      speciesId: taxonId
    },
    userId: 1234,
    appId: 'test',
    locale: 'en'
  });

  var log = {
    info: () => {},
    error: () => {}
  };
    
  return card.populateDefaultsAndChoices(log)
    .then((card) => {
      speciesDataSupplier._resetApiCaller();
      return card;
    })
    .catch((e) => {
      speciesDataSupplier._resetApiCaller();
      throw e;
    });
}
module.exports.getCard = getCard;

function readApiData() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../data/api-responses.json')));
}

