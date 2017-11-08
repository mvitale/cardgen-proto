var reqlib = require('app-root-path').require;
var fs = require('fs')
  , path = require('path')
  , Card = reqlib('lib/models/card')
  , speciesDataSupplier = reqlib('lib/suppliers/data/species-data-supplier')
  ;

var taxonId = 327940;
module.exports.taxonId = taxonId;

function getCard(cb) {
  readApiData((err, data) => {
    if (err) return cb(err);

    speciesDataSupplier._setApiCaller({
      getJson: function(apiName, params, cb) {
        var result;

        if (apiName === 'pages') {
          result = data.pages;
        } else if (apiName === 'hierarchy_entries') {
          result = data.hierarchyEntries;
        }

        if (!result) return cb(new Error('Unexpected api name in fake api caller: ' + apiName));

        cb(null, result);
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
    
    try {
      card.populateDefaultsAndChoices((err) => {
        speciesDataSupplier._resetApiCaller();

        if (err) {
          return cb(err);
        } else {
          return cb(null, card);
        }
      });
    } catch(e) {
      speciesDataSupplier._resetApiCaller();
      console.error(e);
    }
  });
}
module.exports.getCard = getCard;

function readApiData(cb) {
  fs.readFile(path.join(__dirname, '../data/api-responses.json'), (err, data) => {
    if (err) {
      return cb(err);
    }

    cb(null, JSON.parse(data));
  });
}

