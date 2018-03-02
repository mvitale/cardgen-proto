var reqlib = require('app-root-path').require
  , fs = require('fs')
  , parse = require('csv-parse/lib/sync')
  , argv = require('minimist')(process.argv.slice(2))
  , bunyan = require('bunyan')
  , mongoose = require('mongoose')
  , Card = reqlib('lib/models/card')
  , Deck = reqlib('lib/models/deck')
  , CardsJob = reqlib('lib/collection-cards-job')
  , CardWrapper = reqlib('lib/template-renderer/card-wrapper')
  , templateSupplier = reqlib('lib/card-wrapper-template-supplier')
  ;

reqlib('lib/init')();
CardWrapper.setTemplateSupplier(templateSupplier);

if (!argv.appId || !argv.file || !argv.userId) {
  console.log('Usage: $ node lib/card-importer.js --file <file_name> --userId <user_id> --appId <app_id>');
  process.exit(1);
}

var appId = argv.appId
  , locale = 'en'
  , rawData = fs.readFileSync(argv.file)
  , userId = argv.userId
  , data = parse(rawData, {
      delimiter: '\t',
      columns: true,
      quote: false
    })
  , done = false
  ;

var iucnChoiceIndices = {
  'LC': 0,
  'NE': 8,
  'NT': 1,
  'VU': 2,
  'EN': 3,
  'DD': 7,
  'CR': 4
};

var foodwebChoiceIndices = {
  'APEX': 0,
  'DECO': 3,
  'CARN': 2,
  'OMNI': 6,
  'HERB': 5,
  'AUTO': 1,
  'SANG': 7,
  'DETR': 4,
  'MULTI': 8
};

var decksByName = data.reduce((xs, row) => {
  (xs[row.deck_name] = xs[row.deck_name] || []).push(row);
  return xs;
}, {});

var promises = []
  , log = bunyan.createLogger({ name: 'card-importer' })
  ;

Object.keys(decksByName).forEach((deckName) => {
  var rows = decksByName[deckName]
    , deckParams = {
        userId: userId,
        appId: appId, 
        name: deckName
      }
    ;

  promises.push(Deck.findOne(deckParams)
    .exec()
    .then((deck) => {
      if (deck) {
        return deck;
      } else {
        return Deck.create(deckParams);
      }
    })
    .then((deck) => {
      var cardPromises = [];

      rows.forEach((row) => {
        var card = Card.new({
          appId: appId,
          userId: userId,
          locale: locale,
          _deck: deck, 
          templateName: 'trait',
          templateParams: {
            speciesId: row.eol_id
          }
        });

        cardPromises.push(card.populateDefaultsAndChoices(log)
          .then((card) => {
            return modifyCard(card, row);
          })
          .then((card) => {
            return card.save();
          })
          .then((card) => {
            console.log('created card: ' + row.com_name + ' in ' + deck.name);
          })
          .catch((err) => {
            console.log('failed to create card: ' + row.eol_id + ' in ' + deck.name);
            console.log(err);
          }));
      });

      return Promise.all(cardPromises);
    }));
});

Promise.all(promises).then(process.exit);

function modifyCard(card, row) {
  return new Promise((resolve, reject) => {
    CardWrapper.newInstance(card, (err, wrapped) => {
      if (err) {
        return reject(err);
      }

      var foodwebIndex = foodwebChoiceIndices[row.trophic_id]
        , iucnIndex = iucnChoiceIndices[row.iucn_cat]
        , miscTxt = []
        ;

      if (foodwebIndex != null) {
        wrapped.setChoiceKey('foodwebRole', foodwebIndex);
      }

      if (iucnIndex != null) {
        wrapped.setChoiceKey('iucnStatus', iucnIndex);
      }

      wrapped.setDataAttr('commonName', 'text', row.com_name);
      wrapped.setDataAttr('sciName', 'text', row.sci_name);
      wrapped.setDataAttr('taxonClass', 'text', row.grp_name);

      wrapped.setUserDataAttr('mainPhoto', 'fromUrl', 'url', row.img_url); 
      wrapped.setUserDataAttr('mainPhoto', 'fromUrl', 'thumbUrl', row.img_url); 
      wrapped.setUserDataAttr('mainPhoto', 'fromUrl', 'credit', { text: row.img_credit });
      wrapped.setUserDataRef('mainPhoto', 'fromUrl');

      wrapped.setKeyValText('traits', 'key', 0, row.t1_label);
      wrapped.setKeyValText('traits', 'key', 1, row.t2_label);
      wrapped.setKeyValText('traits', 'key', 2, row.t3_label);
      wrapped.setKeyValText('traits', 'key', 3, row.t4_label);
      wrapped.setKeyValText('traits', 'key', 4, row.t5_label);

      wrapped.setKeyValText('traits', 'val', 0, row.t1_val);
      wrapped.setKeyValText('traits', 'val', 1, row.t2_val);
      wrapped.setKeyValText('traits', 'val', 2, row.t3_val);
      wrapped.setKeyValText('traits', 'val', 3, row.t4_val);
      wrapped.setKeyValText('traits', 'val', 4, row.t5_val);

      if (row.geo_title && row.geo_title.length) {
        miscTxt.push(row.geo_title);
      }

      if (row.geo_1 && row.geo_1.length) {
        miscTxt.push(row.geo_1);
      }

      if (row.geo_2 && row.geo_2.length) {
        miscTxt.push(row.geo_2);
      }

      if (row.geo_3 && row.geo_3.length) {
        miscTxt.push(row.geo_3);
      }

      wrapped.setDataAttr('miscInfo', 'text', miscTxt.join('\n'));
      resolve(card);
    });
  });
}

/*
 
 mysql> select distinct iucn_cat from cards.template_trait;
 +----------+
 | iucn_cat |
 +----------+
 | LC       |
 | NE       |
 | NT       |
 | VU       |
 | EN       |
 | DD       |
 | CR       |


+------------+
| trophic_id |
+------------+
| APEX       |
| DECO       |
| CARN       |
| OMNI       |
| HERB       |
| AUTO       |
|            |
| SANG       |
| NECT       |
| DETR       |
| MULTI      |
| MÃšLTI     |
+------------+
*/
