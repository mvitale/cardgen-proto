var reqlib = require('app-root-path').require
  , bunyan = require('bunyan')
  , args = require('minimist')(process.argv.slice(2))
  , fs = require('fs')
  , init = require('../../init')
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
  cardUtil.getCard(printErrOrResult);
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
    '$ node scripts/test-card-api-data.js --type [api|card]');
}

