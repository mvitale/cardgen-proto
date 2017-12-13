var reqlib = require('app-root-path').require
  , mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , mongoose = require('mongoose')
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
    , fakeId = '111111111111111111111111'
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
          .then((theDecks) => {
            expect(theDecks).to.exist;
            expect(theDecks).to.be.empty;
          });
      });
    });

    context('when there are decks that belong to the user', () => {
      beforeEach((done) => {
        createUserDecks((theDecks) => {
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
        createBothDeckTypes((theDecks) => {
          decks = theDecks;
          done();
        });
      });

      itResolvesWithTheExpectedResult();
    });

    afterEach(() => {
      decks = null;
    });
  });

  describe('#allDeckIdsForUser', () => {
    var ids = [];

    function itResolvesWithExpectedResult() {
      it('resolves with the expected result', () => {
        return resourceHelpers.allDeckIdsForUser(appId, userId)
          .then((theIds) => {
            expect(theIds).to.exist;
            expect(theIds).to.have.deep.members(ids);
            expectSortedIds(theIds);
          });
      });
    }

    context('when there are no decks', () => {
      it('resolves with an empty result', () => {
        return resourceHelpers.allDeckIdsForUser(appId, userId)
          .then((theIds) => {
            expect(theIds).to.exist;
            expect(theIds).to.be.empty;
          });
      });
    });

    context('when there are decks that belong to the user', () => {
      beforeEach((done) => {
        createUserDecks((decks) => {
          ids = resourceIds(decks);
          done();
        });
      });

      itResolvesWithExpectedResult();
    });

    context('when there are decks that the user has permission on', () => {
      beforeEach((done) => {
        createUserPermissionDecks((decks) => {
          ids = resourceIds(decks);
          done();
        });
      });

      itResolvesWithExpectedResult();
    });

    context('when there are decks that belong to the user and decks that the user has permission on', () => {
      beforeEach((done) => {
        createBothDeckTypes((decks) => {
          ids = resourceIds(decks);
          done();
        });
      });

      itResolvesWithExpectedResult();
    });
  });

  describe('#deckForUser', () => {
    var deck;

    function itResolvesWithTheExpectedDeck() {
      it('resolves with the expected deck', () => {
        return resourceHelpers.deckForUser(appId, userId, deck._id.toString())
          .then((theDeck) => {
            expect(theDeck).to.exist;
            expect(theDeck._id).to.eql(deck._id);
          });
      });
    }

    context('when no such deck exists', () => {
      it('resolves with null result', () => {

        return resourceHelpers.deckForUser(appId, userId, fakeId)
          .then((result) => {
            expect(result).to.be.null;
          });
      });
    });

    context('when the user owns the deck', () => {
      beforeEach((done) => {
        Deck.create({
          userId: userId,
          appId: appId,
          name: 'mydeck'
        }, (err, theDeck) => {
          if (err) {
            throw err;
          }
          
          deck = theDeck;
          done();
        });
      });

      itResolvesWithTheExpectedDeck();
    });

    context('when the user has permission on the deck', () => {
      beforeEach((done) => {
        Deck.create({
          userId: userId,
          appId: appId,
          name: 'someoneElsesDeck',
          userIds: [1234, userId, 111111, 55]
        }, (err, theDeck) => {
          if (err) {
            throw err;
          }

          deck = theDeck;
          done();
        });
      });

      itResolvesWithTheExpectedDeck();
    });
  });

  describe('#allCardsForUser', () => {
    var cards;

    function itResolvesWithTheExpectedCards() {
      it('resolves with the expected cards', () => {
        return resourceHelpers.allCardsForUser(appId, userId)
          .then((theCards) => {
            expectSameIds(cards, theCards);
          });
      });
    }

    context('when there are no cards', () => {
      it('resolves with an empty result', () => {
        return resourceHelpers.allCardsForUser(appId, userId)
          .then((cards) => {
            expect(cards).to.exist;
            expect(cards).to.be.empty;
          });
      });
    });

    context('when there are cards that belong to the user', () => {
      beforeEach((done) => {
        createUserCards((theCards) => {
          cards = theCards;
          done();
        });
      });

      itResolvesWithTheExpectedCards();
    });

    context('when there are cards that belong to the user ' +
      'in decks that belong to the user', () => {
      beforeEach((done) => {
        createUserDeck((deck) => {
          createCardsInDeck(deck, userId, (theCards) => {
            cards = theCards;
            done()
          });
        });
      });

      itResolvesWithTheExpectedCards();
    })

    context('when there are cards in a deck that the user has permission on', () => {
      beforeEach((done) => {
        Deck.create({
          appId: appId, 
          userId: 100,
          userIds: [10, 20, userId],
          name: 'thedeck'
        }, (err, deck) => {
          if (err) throw err;

          createCardsInDeck(deck, 100, (theCards) => {
            cards = theCards;
            done();
          });
        });
      });

      itResolvesWithTheExpectedCards();
    });
    
    function createUserCards(cb) {
      createCardsInDeck(null, userId, cb);
    }

    function createCardsInDeck(deck, userId, cb) {
      var numCards = 3
        , cards = []
        ;

      for (var i = 0; i < numCards; i++) {
        Card.create({
          appId: appId,
          userId: userId,
          locale:locale,
          templateName: templateName,
          templateVersion: templateVersion,
          _deck: deck
        }, (err, card) => {
          if (err) {
            throw err;
          }

          cards.push(card);
          if (cards.length === numCards) {
            cb(cards);
          }
        })
      }
    }
  });

  describe('#deckForUser', () => {
    context("when the deck doesn't exist", () => {
      it('resolves with null', () => {
        return resourceHelpers.deckForUser(appId, userId, fakeId)
          .then((theDeck) => {
            expect(theDeck).to.be.null;
          });
      });
    });
    
    context("when the deck exists but the user doesn't have access", () => {
      var deckId;

      beforeEach((done) => {
        Deck.create({
          appId: appId,
          userId: 100,
          name: 'deck'
        }, (err, deck) => {
          if (err) throw err; 
          deckId = deck._id.toString();
          done();
        });
      });

      it('resolves with null', () => {
        return resourceHelpers.deckForUser(appId, userId, deckId)
          .then((deck) => {
            expect(deck).to.be.null;
          });
      });
    });

    context('when the user owns the deck', () => {
      var deck;

      beforeEach((done) => {
        createUserDeck((theDeck) => {
          deck = theDeck;
          done();
        });
      });

      it('resolves with the deck', () => {
        return resourceHelpers.deckForUser(appId, userId, deck._id.toString())
          .then((theDeck) => {
            expect(theDeck).to.exist;
            expect(theDeck._id).to.eql(deck._id);
          });
      });
    });

    context('when the user has permission on the deck', () => {
      var deck;

      beforeEach((done) => {
        Deck.create({
          name: 'deck',
          appId: appId,
          userId: 100,
          userIds: [20, userId, 10],
        }, (err, theDeck) =>  {
          if (err) throw err;
          deck = theDeck;
          done();
        });
      });

      it('resolves with the deck', () => {
        return resourceHelpers.deckForUser(appId, userId, deck._id.toString())
          .then((theDeck) => {
            expect(theDeck).to.exist;
            expect(theDeck._id).to.eql(deck._id);
          });
      });
    });
  });

  describe('#cardForUser', () => {
    context("when the card doesn't exist", () => {
      it('resolves with null', () => {
        return resourceHelpers.cardForUser(appId, userId, fakeId)
          .then((card) => {
            expect(card).to.be.null;
          });
      });
    });

    context("when the card exists but the user doesn't have access", () => {
      var cardId;

      beforeEach((done) => {
        Card.create({
          userId: 100,
          appId: appId,
          locale: locale,
          templateName: templateName,
          templateVersion: templateVersion
        }, (err, card) => {
          if (err) throw err;
          cardId = card._id.toString();
          done();
        });
      });

      it('resolves with null', () => {
        return resourceHelpers.cardForUser(appId, userId, cardId)
          .then((card) => {
            expect(card).to.be.null; 
          });
      });
    });

    context('when the card belongs to the user', () => {
      var card;

      beforeEach((done) => {
        Card.create({
          userId: userId,
          appId: appId,
          locale: locale,
          templateName: templateName,
          templateVersion: templateVersion
        }, (err, theCard) => {
          if (err) throw err;
          card = theCard;
          done();
        });
      });

      it('resolves with the card', () => {
        return resourceHelpers.cardForUser(appId, userId, card._id.toString())
          .then((theCard) => {
            expect(theCard).to.exist;
            expect(theCard._id).to.eql(card._id);
          });
      });
    });

    context('when the card is in a deck that the user has permission on', () => {
      var card;

      beforeEach((done) => {
        Deck.create({
          name: 'deck',
          appId: appId,
          userId: 100,
          userIds: [20, userId, 10],
        }, (err, deck) =>  {
          if (err) throw err;

          Card.create({
            userId: userId,
            appId: appId,
            locale: locale,
            templateName: templateName,
            templateVersion: templateVersion,
            _deck: deck
          }, (err, theCard) => {
            if (err) throw err;
            card = theCard;
            done();
          });
        });
      });

      it('resolves with the card', () => {
        return resourceHelpers.cardForUser(appId, userId, card._id.toString())
          .then((theCard) => {
            expect(theCard).to.exist;
            expect(theCard._id).to.eql(card._id);
          });
      });
    });
  });

  describe('#addUserToDeck', () => {
    var newUserId = 10
      , deckId
      ;

    function itRejects() {
      it('rejects with the correct error', () => {
          return resourceHelpers.addUserToDeck(appId, userId, newUserId, deckId.toString())
            .then(expect.fail)
            .catch((err) => {
              expect(err).to.eql(
                new TypeError('Deck not found (userId: ' + userId + ', deckId: ' + deckId + ')')
              );
            });

      });
    }

    context('when the deck exists', () => {
      function itAddsTheUserToTheDeck() {
        it('adds the user to the deck idempotently', (done) => {
          resourceHelpers.addUserToDeck(appId, userId, newUserId, deckId.toString())
            .then((deck) => {
              expect(deck).to.exist;
              expect(deckId).to.eql(deck._id); 
              expect(deck.userIds).to.include.members([newUserId]);

              resourceHelpers.addUserToDeck(appId, userId, newUserId, deckId.toString())
                .then((sameDeck) => {
                  expect(sameDeck.userIds.length).to.equal(deck.userIds.length);
                  done();
                });
            })
        });
      }

      context('when the requesting user owns the deck', () => {
        beforeEach((done) => {
          Deck.create({
            userId: userId,
            appId: appId,
            name: 'deck'
          }, (err, deck) => {
            if (err) throw err;
            deckId = deck._id;
            done();
          });
        });

        itAddsTheUserToTheDeck();
      });

      context('when the requesting user has permission on the deck', () =>{
        beforeEach((done) => {
          Deck.create({
            userId: 20,
            appId: appId,
            name: 'deck',
            userIds: [userId]
          }, (err, deck) => {
            if (err) throw err;
            deckId = deck._id;
            done();
          });
        });

        itAddsTheUserToTheDeck();
      });

      context("when the requesting user doesn't have permission on the deck", () => {
        beforeEach((done) => {
          Deck.create({
            userId: 20,
            appId: appId,
            name: 'deck'
          }, (err, deck) => {
            if (err) throw err;
            deckId = deck._id;
            done();
          });
        });

        itRejects();
      });
    });

    context("when the deck doesn't exist", () => {
      beforeEach(() => {
        deckId = new mongoose.Types.ObjectId(fakeId);
      });

      itRejects();
    });
  });

  function createUserDecks(cb) {
    var decks = []
      , n = 3
      ;  

    for(var i = 0; i < n; i++) {
      createUserDeck((deck) => {
        decks.push(deck);
        if (decks.length === n) {
          cb(decks);
        }
      });
    }
  }
  
  function createUserDeck(cb) {
    Deck.create({
      appId: appId,
      userId: userId,
      name: 'deck_' + Math.random()
    }, (err, deck) => {
      if (err) throw err;
      cb(deck);
    });
  }
  
  function createUserPermissionDecks(cb) {
    var decks = [];

    Deck.create({
      name: 'anotherUsersDeck',
      userId: 100,
      userIds: [userId],
      appId: appId
    }, (err, deck1) => {
      if (err) {
        throw err;
      }

      Deck.create({
        name: 'yetAnotherUsersDeck',
        userId: 200,
        userIds: [17, userId, 30],
        appId: appId
      }, (err, deck2) => {
        if (err) {
          throw err;
        }

        decks.push(deck2)
        cb([deck1, deck2]);
      });
    });
  }

  function createBothDeckTypes(cb) {
    createUserPermissionDecks((permissionDecks) => {
      createUserDecks((userDecks) => {
        cb(permissionDecks.concat(userDecks));
      });
    });
  };

  function expectSortedById(resources) {
    expectSortedIds(resourceIds(resources));
  }

  function expectSortedIds(ids) {
    var prevId = '';

    ids.forEach((id) => {
      var curId = id.toString();
      expect(curId).to.be.above(prevId);
      prevId = curId;
    });
  }

  function expectSameIds(expectedResources, actualResources) {
    expect(actualResources).to.exist;
    expect(actualResources.length).to.equal(expectedResources.length);
    expectedResources.forEach((expected) => {
      expect(actualResources.find((actual) => {
        return actual._id.toString() === expected._id.toString();  
      })).to.exist;
    });
  }

  function resourceIds(resources) {
    return resources.map((resource) => {
      return resource._id;
    });
  };
});

