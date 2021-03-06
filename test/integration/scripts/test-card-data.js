var init = require('../../init');

init.init()
.then(() => {
  var reqlib = require('app-root-path').require
    , bunyan = require('bunyan')
    , args = require('minimist')(process.argv.slice(2))
    , fs = require('fs')
    , cardUtil = require('../util/card')
    , speciesDataSupplier = reqlib('lib/suppliers/data/species-data-supplier')
    ;

  var validModes = ['card', 'api'];

  var mode = args.type;

  var log = bunyan.createLogger({name: 'test-card-data-script'});

  if (mode === 'card') {
    printCard();
  } else if (mode === 'api') {
    printApiResults();
  } else {
    printUsage();
  }

  function printCard() {
    cardUtil.getCard()
      .then((card) => {
        printErrOrResult(null, card); 
      })
      .catch((err) => {
        printErrOrResult(err); 
      });
  }

  function printApiResults() {
    speciesDataSupplier._makeApiCalls({
      speciesId: cardUtil.taxonId
    }, log, printErrOrResult);
  }

  function printErrOrResult(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  }

  function printUsage() {
    console.log('usage:\n' + 
      '$ node scripts/test-card-data.js --type [api|card]');
  }
});


