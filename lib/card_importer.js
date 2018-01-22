var reqlib = require('app-root-path').require
  , fs = require('fs')
  , parse = require('csv-parse/lib/sync')
  , argv = require('minimist')(process.argv.slice(2))
  , bunyan = require('bunyan')
  , mongoose = require('mongoose')
  , Card = reqlib('lib/models/card')
  , Deck = reqlib('lib/models/deck')
  , CardsJob = reqlib('lib/collection-cards-job')
  ;

reqlib('lib/init')()
mongoose.Promise = Promise;

var userId = 1
  , appId = 'localTest'
  , locale = 'en'
  , rawData = fs.readFileSync(argv.file)
  , data = parse(rawData, {
      delimiter: '\t',
      columns: true
    })
  , done = false
  ;

var decksByName = data.reduce((xs, row) => {
  (xs[row.deck_name] = xs[row.deck_name] || []).push(row);
  return xs;
}, {});

Object.keys(decksByName).forEach((deckName) => {
  var rows = decksByName[deckName];

  var deckParams = {
    userId: userId,
    appId: appId, 
    name: deckName
  };

  console.log('deck params', deckParams);

  Deck.findOne(deckParams)
    .exec()
    .then((deck) => {
      console.log('do we have a deck?', deck);
      if (deck) {
        return deck;
      } else {
        return Deck.create(deckParams);
      }
    })
    .then((deck) => {
      console.log('here we gooooo');
      CardsJob.new(appId, userId, locale, deck, rows.map((row) => row.eol_id), bunyan.createLogger({name: 'card_importer'})).start()
        .then((cards) => {
          console.log(cards);
          done = true;
        });
    })
    .catch((err) => {
      console.log('we done');
      console.log(err);
      done = true;
    });
});

function checkIfDone() {
  if (!done) {
    setTimeout(checkIfDone, 1000);
  } else {
    process.exit();
  }
}

checkIfDone();
