var reqlib = require('app-root-path').require
  , mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , db = reqlib('test/util/db')
  , resourceHelpers = reqlib('lib/models/resource-helpers')
  , Card = reqlib('lib/models/card')
  , Deck = reqlib('lib/models/deck')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('resource-helpers', () => {
  db();

  var userId = 1
    , appId = 'appId'
    , locale = 'en'
    , templateName = 'trait'
    , templateVersion = '1.0'
    ;

  describe('#allCardsForUser', () => {

    context('when the user has a card that belongs to them', () => {
      var card;

      beforeEach((done) => {
        Card.create({
          userId: userId,
          appId: appId,
          locale: locale,
          templateName: templateName,
          templateVersion: templateVersion
        }, (err, theCard) => {
          if (err) {
            throw err;
          }

          card = theCard; 
          done();
        });
      });

      it('returns them', () => {
        return resourceHelpers.allCardsForUser(appId, userId)
          .then((cards) => {
            expect(cards.length).to.equal(1);
            expect(cards[0]._id).to.eql(card._id);
          });
      });
    });
  });

  describe('#allDecksForUser', () => {
    var decks;
    
    function itResolvesWithTheExpectedResult() {
      it('resolves with them sorted by id', () => {
        return resourceHelpers.allDecksForUser(appId, userId)
          .then((theDecks) => {
            expectSameIds(decks, theDecks);
            expectSortedById(theDecks);
          });
      });
    }

    context('when there are no decks', () => {
      it('resolves with an empty result', () => {
        return resourceHelpers.allDecksForUser(appId, userId)
          .then((decks) => {
            expect(decks).to.exist;
            expect(decks).to.be.empty;
          });
      });
    });

    context('when there are decks that belong to the user', () => {
      var numDecks = 3
        ;

      beforeEach((done) => {
        createUserDecks(numDecks, (theDecks) => {
          decks = theDecks;
          done();
        });
      });
      
      itResolvesWithTheExpectedResult();
    });

    context('when there are decks that the user has permissions on', () => {
      beforeEach((done) => {
        createUserPermissionDecks((theDecks) => {
          decks = theDecks;
          done();
        });
      });

      itResolvesWithTheExpectedResult();
    });

    context('when there are decks that belong to the user and decks that the user has permissions on', () => {
      beforeEach((done) => {
        createUserPermissionDecks((theDecks) => {
          decks = theDecks;

          createUserDecks(3, (theDecks) => {
            decks = decks.concat(theDecks);
            done();
          });
        });
      });

      itResolvesWithTheExpectedResult();
    });

    afterEach(() => {
      decks = null;
    });
  });

  function createUserDecks(n, cb) {
    var decks = [];  

    deckCreatedCb = (err, deck) => {
      if (err) {
        throw err;
      }

      decks.push(deck);

      if (decks.length === n) {
        cb(decks);
      }
    }

    for (var i = 0; i < n; i++) {
      Deck.create({
        appId: appId,
        userId: userId,
        name: 'deck_' + i
      }, deckCreatedCb);
    }
  }
  
  function createUserPermissionDecks(cb) {
    var decks = [];

    Deck.create({
      name: 'anotherUsersDeck',
      userId: 100,
      userIds: [userId],
      appId: appId
    }, (err, deck) => {
      if (err) {
        throw err;
      }

      decks.push(deck)
    });

    Deck.create({
      name: 'yetAnotherUsersDeck',
      userId: 200,
      userIds: [17, userId, 30],
      appId: appId
    }, (err, deck) => {
      if (err) {
        throw err;
      }

      decks.push(deck)
      cb(decks);
    });
  }

  function expectSortedById(resources) {
    var prevId = '';

    resources.forEach((resource) => {
      var curId = resource._id.toString();
      expect(curId).to.be.above(prevId);
      prevId = curId;
    });
  }

  function expectSameIds(expectedResources, actualResources) {
    expectedResources.forEach((expected) => {
      expect(actualResources.find((actual) => {
        return actual._id.toString() === expected._id.toString();  
      })).to.exist;
    });
  }
});

