var reqlib = require('app-root-path').require;
var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var sinonMongoose = require('sinon-mongoose');
var mongoose = require('mongoose');
var PDFDocument = require('pdfkit');

var cardRoutes = reqlib('lib/routes/cards')
  , Card = reqlib('lib/models/card')
  , Deck = reqlib('lib/models/deck')
  , resUtils = reqlib('lib/routes/util/res-utils')
  , MongooseWrapper = reqlib('lib/api-wrappers/mongoose-wrapper')
  , CardSummaryWrapper = reqlib('lib/api-wrappers/card-summary-wrapper')
  , cardSvgCache = reqlib('lib/card-svg-loading-cache')
  , deckPdfMaker = reqlib('lib/deck-pdf-maker')
  , cardBackStore = reqlib('lib/card-back-store')
  , resourceHelpers = reqlib('lib/models/resource-helpers')
  , collectionCardCreator = reqlib('lib/collection-card-creator')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('cards', () => {
  var newCardStub
    , stubCard
    , req
    , res
    , jsonRes
    , errJsonRes
    , handleModelErr
    ;

  function setUpSuccessCard() {
    stubCard.populateDefaultsAndChoices.yields();
    stubCard.save.yields(null, stubCard);
  }

  function verifyCardCreated() {
    expect(stubCard.populateDefaultsAndChoices).to.have.been.calledOnce;
    expect(stubCard.save).to.have.been.calledOnce;

    expect(jsonRes).to.have.been.calledOnce;

    jsonResArgs = jsonRes.getCall(0).args;

    expect(jsonResArgs[0]).to.equal(res);
    expect(jsonResArgs[1]).to.equal(resUtils.httpStatus.created);
    expect(jsonResArgs[2].delegate).to.equal(stubCard);
  }

  beforeEach(() => {
    newCardStub = sandbox.stub(Card, 'new');
    stubCard = sinon.createStubInstance(Card);
    newCardStub.returns(stubCard);
    jsonRes = sandbox.stub(resUtils, 'jsonRes');
    errJsonRes = sandbox.stub(resUtils, 'errJsonRes');
    handleModelErr = sandbox.stub(resUtils, 'handleModelErr');
    res = sandbox.stub();
  });

  describe('#createCard', () => {
    var userId = 1
      , appId = 'appId'
      , locale = 'es'
      ;

    beforeEach(() => {
      req = {
        body: {},
        params: {
          userId: 1,
        },
        appId: appId,
        locale: locale
      }
    });

    context('success pathway', () => {
      beforeEach(() => {
        setUpSuccessCard();
        cardRoutes.createCard(req, res);
      });

      it('creates a Card and sets the correct response', () => {
        var jsonResArgs;

        expect(newCardStub).to.have.been.calledWith({
          userId: userId,
          appId: appId,
          locale: locale
        });
        verifyCardCreated();
      });
    });

    context('when populateDefaultsAndChoices returns an error', () => {
      var error = new Error('populateDefaultsAndChoices failed')
        ;

      beforeEach(() => {
        stubCard.populateDefaultsAndChoices.yields(error);
        cardRoutes.createCard(req, res);
      });

      it('sets the correct error response', () => {
        expect(errJsonRes).to.have.been.calledWith(res, error);
      });
    });

    context('when save returns an error', () => {
      var error = new Error('save failed')
        ;

      beforeEach(() => {
        stubCard.populateDefaultsAndChoices.yields();
        stubCard.save.yields(error);

        cardRoutes.createCard(req, res);
      });

      it('sets the correct error response', () => {
        expect(stubCard.populateDefaultsAndChoices).to.have.been.calledOnce;
        expect(errJsonRes).to.have.been.calledWith(res, error);
      });
    });
  });

  describe('#createCardInDeck', () => {
    var fakeDeck = { deck: true }
      , userId = 1
      , deckId = 2
      , appId = 'appId'
      , locale = 'zh'
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          deckId: deckId
        },
        appId: appId,
        locale: locale
      };
      sandbox.stub(resourceHelpers, 'deckForUser');
    });

    context('success pathway', () => {
      beforeEach(() => {
        setUpSuccessCard();
        resourceHelpers.deckForUser.resolves(fakeDeck);
      });

      it('creates the Card and sets the correct response', () => {
        return cardRoutes.createCardInDeck(req, res)
          .then(() => {
            expect(Card.new).to.have.been.calledWith({
              userId: userId,
              appId: appId,
              _deck: fakeDeck,
              locale: locale
            });
            verifyCardCreated();
          });
      });
    });

    context('when the deck is not found', () => {
      beforeEach(() => {
        resourceHelpers.deckForUser.resolves(null);
      });

      it('sets the correct error on the response', () => {
        return cardRoutes.createCardInDeck(req, res)
          .then(() => {
            expect(jsonRes).to.have.been.calledWith(
              res, 
              resUtils.httpStatus.notFound, 
              {
                msg: 'Deck 2 belonging to user 1 not found'
              }
            );
          });
      });
    });

    context('when Deck.find returns an error', () => {
      var error = new Error('Something went wrong in find');

      beforeEach(() => {
        resourceHelpers.deckForUser.rejects(error);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.createCardInDeck(req, res)
          .then(() => {
            expect(errJsonRes).to.have.been.calledWith(res, error);
          });
      });
    })
  });

  describe('#save', () => {
    var userId = 1
      , appId = 'appId'
      , cardId = 'ABC134'
      , dataUpdate = { foo: 'bar' }
      , userDataUpdate = { baz: 'bop' }
      , update = { data: dataUpdate, userData: userDataUpdate }
      , fakeCard
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          cardId: cardId
        },
        appId: appId,
        body: update
      };

      fakeCard = { version: 1 };

      sandbox.stub(resourceHelpers, 'cardForUser');
    });

    context('success pathway', () => {
      beforeEach(() => {
        fakeCard.save = sandbox.stub().resolves();
        resourceHelpers.cardForUser.withArgs(appId, userId, cardId)
          .resolves(fakeCard);
      });

      it('updates the card and calls jsonRes with the correct arguments', () => {
        return cardRoutes.save(req, res)
          .then(() => {
            var args;

            expect(fakeCard.data).to.equal(dataUpdate);
            expect(fakeCard.userData).to.equal(userDataUpdate);
            expect(fakeCard.version).to.equal(2);
            expect(fakeCard.save).to.have.been.calledOnce;

            expect(jsonRes).to.have.been.calledOnce;
            args = jsonRes.getCall(0).args;

            expect(args[0]).to.equal(res);
            expect(args[1]).to.equal(resUtils.httpStatus.ok);
            expect(args[2]).to.be.an.instanceof(MongooseWrapper);
            expect(args[2].delegate).to.equal(fakeCard);
          });
      });
    });

    context('when card is not found', () => {
      beforeEach(() => {
        resourceHelpers.cardForUser.resolves(null);
      });

      it('calls jsonRes with the correct error message', () => {
        return cardRoutes.save(req, res)
          .then(() => {
            expect(jsonRes).to.have.been.calledOnce.calledWith(
              res,
              resUtils.httpStatus.notFound,
              { msg: cardNotFoundMessage(cardId, userId) }
            );
          });
      });
    });

    context('when Card.find yields an error', () => {
      var error = new Error('find error!');

      beforeEach(() =>  {
        resourceHelpers.cardForUser.rejects(error);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.save(req, res)
          .then(() => {
            expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
            expect(jsonRes).not.to.have.been.called;
          });
      });
    });

    context('when saving card yields an error', () => {
      var error = new Error('failed to save card');

      beforeEach(() => {
        resourceHelpers.cardForUser.resolves(fakeCard);
        fakeCard.save = sandbox.stub().rejects(error);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.save(req, res)
          .then(() => {
            expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
            expect(jsonRes).not.to.have.been.called;
          });
      });
    });
  });

  describe('#assignCardDeck', () => {
    var cardId = 'asdf1234'
      , deckId = 'fdas4312'
      , userId = 1
      , appId = 'appId'
      , findOneCard
      , findOneDeck
      , fakeCard
      , fakeDeck = { its: 'a deck' }
      ;

    function setupFindOneCardSuccess() {
      fakeCard = { version: 1 };
      fakeCard.save = sandbox.stub().callsFake((cb) => {
        expect(fakeCard._deck).to.equal(fakeDeck);
        cb(null, fakeCard);
      });

      findOneCard.withArgs({ _id: cardId, userId: userId, appId: appId })
        .yields(null, fakeCard);
    }

    beforeEach(() => {
      req = {
        params: {
          cardId: cardId,
          userId: userId
        },
        appId: appId,
        body: deckId
      };

      findOneCard = sandbox.stub(Card, 'findOne');
      findOneDeck = sandbox.stub(Deck, 'findOne');
    });

    context('success path', () => {
      var save;

      beforeEach(() => {
        setupFindOneCardSuccess();

        findOneDeck.withArgs({ _id: deckId, userId: userId, appId: appId })
          .yields(null, fakeDeck);

        cardRoutes.assignCardDeck(req, res);
      });

      it('sets the _deck on the card and calls jsonRes correctly', () => {
        var args;

        expect(fakeCard.save).to.have.been.calledOnce;
        expect(jsonRes).to.have.been.calledOnce;

        args = jsonRes.getCall(0).args;

        expect(args.length).to.equal(3);
        expect(args[0]).to.equal(res);
        expect(args[1]).to.equal(resUtils.httpStatus.ok);
        expect(args[2]).to.be.an.instanceof(CardSummaryWrapper);
        expect(args[2].delegate).to.equal(fakeCard);
      });
    });

    context("when the card isn't found", () => {
      beforeEach(() => {
        findOneCard.yields(null, null);

        cardRoutes.assignCardDeck(req, res);
      });

      it('calls jsonRes with an appropriate error', () => {
        expect(jsonRes).to.have.been.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: cardNotFoundMessage(cardId, userId) }
        );
      });
    });

    context('when Card.findOne yields an error', () => {
      var error = new Error('Card.find error');

      beforeEach(() => {
        findOneCard.yields(error);

        cardRoutes.assignCardDeck(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });

    context("when the deck isn't found", () => {
      beforeEach(() => {
        setupFindOneCardSuccess();

        findOneDeck.yields(null, null);

        cardRoutes.assignCardDeck(req, res);
      });

      it('calls jsonRes with the correct message and status', () => {
        expect(jsonRes).to.have.been.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: deckNotFoundMessage(deckId, userId) }
        );
      });
    });

    context('when Deck.find yields an error', () => {
      var error = new Error('error in Deck.find');

      beforeEach(() => {
        setupFindOneCardSuccess();

        findOneDeck.yields(error);

        cardRoutes.assignCardDeck(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(jsonRes).not.to.have.been.called;
        expect(errJsonRes).to.have.been.calledWith(res, error);
      });
    });
  });

  describe('#removeCardDeck', () => {
    var cardId = 'asdf1234'
      , userId = 1
      , appId = 'appId'
      , findOneCard
      , fakeCard
      ;

    function setupFindOneCardSuccess() {
      fakeCard = { version: 1, _deck: 'foo' };
      fakeCard.save = sandbox.stub().callsFake((cb) => {
        expect(fakeCard._deck).to.equal(null);
        cb(null, fakeCard);
      });

      findOneCard.withArgs({ _id: cardId, userId: userId, appId: appId })
        .yields(null, fakeCard);
    }

    beforeEach(() => {
      req = {
        params: {
          cardId: cardId,
          userId: userId
        },
        appId: appId
      };

      findOneCard = sandbox.stub(Card, 'findOne');
    });

    context('success path', () => {
      var save;

      beforeEach(() => {
        setupFindOneCardSuccess();

        cardRoutes.removeCardDeck(req, res);
      });

      it('sets _deck to null and calls jsonRes correctly', () => {
        var args;

        expect(fakeCard.save).to.have.been.calledOnce;
        expect(jsonRes).to.have.been.calledOnce;

        args = jsonRes.getCall(0).args;

        expect(args.length).to.equal(3);
        expect(args[0]).to.equal(res);
        expect(args[1]).to.equal(resUtils.httpStatus.ok);
        expect(args[2]).to.be.an.instanceof(CardSummaryWrapper);
        expect(args[2].delegate).to.equal(fakeCard);
      });
    });

    context("when the card isn't found", () => {
      beforeEach(() => {
        findOneCard.yields(null, null);

        cardRoutes.removeCardDeck(req, res);
      });

      it('calls jsonRes with an appropriate error', () => {
        expect(jsonRes).to.have.been.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: cardNotFoundMessage(cardId, userId) }
        );
      });
    });

    context('when Card.findOne yields an error', () => {
      var error = new Error('Card.find error');

      beforeEach(() => {
        findOneCard.yields(error);

        cardRoutes.removeCardDeck(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });
  });

  /*
  describe('#cardIdsForUser', () => {
    var findMock
      , userId = 10
      , appId = 'appId'
      , cards
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId
        },
        appId: appId
      };
    });

    context('when there are no cards belonging to the user', () => {
      beforeEach(() => {
        cards = [];

        findMock = sandbox.mock(Card)
          .expects('find').withArgs({ userId: userId, appId: appId })
          .chain('sort').withArgs('-_id')
          .chain('exec')
          .yields(null, cards);

        cardRoutes.cardIdsForUser(req, res);
      });

      it('calls jsonRes with an empty array', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          []
        );

        findMock.verify();
      });
    });

    context('when there are cards belonging to the user', () => {
      var card1 = { _id: 10 }
        , card2 = { _id: 20 }
        ;

      beforeEach(() => {
        cards = [ card1, card2 ];

        findMock = sandbox.mock(Card)
          .expects('find').withArgs({ userId: userId, appId: appId })
          .chain('sort').withArgs('-_id')
          .chain('exec')
          .yields(null, cards);

        cardRoutes.cardIdsForUser(req, res);
      });

      it('calls jsonRes with the ids of all cards', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          [ card1._id, card2._id ]
        );

        findMock.verify();
      });
    });

    context('when find yields an error', () => {
      var error = new Error('error finding Cards');

      beforeEach(() => {
        findMock = sandbox.mock(Card)
          .expects('find').withArgs({ userId: userId, appId: appId })
          .chain('sort').withArgs('-_id')
          .chain('exec')
          .yields(error);

        cardRoutes.cardIdsForUser(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        findMock.verify();
      });
    });
  });
  */

  describe('#cardSummariesForUser', () => {
    var userId = 1
      , appId = 'appId'
      , cards
      , allCardsForUser
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId
        },
        appId: appId
      };
    });

    context("when the user doesn't have any cards", () => {
      beforeEach(() => {
        cards = [];
        sandbox.stub(resourceHelpers, 'allCardsForUser').resolves(cards);
      });

      it('calls jsonRes with an empty Array', () => {
        return cardRoutes.cardSummariesForUser(req, res)
          .then(() => {
            expect(resourceHelpers.allCardsForUser).to.have.been.calledWith(appId, userId);
            expect(resUtils.jsonRes).to.have.been.calledOnce.calledWith(
              res,
              resUtils.httpStatus.ok,
              []
            );
          });
      });
    });

    context('when the user has cards', () => {
      var card1 = { _id: 3 }
        , card2 = { _id: 5 }
        ;

      beforeEach(() => {
        cards = [ card1, card2 ];
        sandbox.stub(resourceHelpers, 'allCardsForUser').resolves(cards);
      });

      it('calls jsonRes with those cards wrapped', () => {
        return cardRoutes.cardSummariesForUser(req, res)
          .then(() => {
            var args;

            expect(resourceHelpers.allCardsForUser).to.have.been.calledOnce.calledWith(appId, userId);
            expect(jsonRes).to.have.been.calledOnce;
            args = jsonRes.getCall(0).args;
            expect(args.length).to.equal(3);
            expect(args[0]).to.equal(res);
            expect(args[1]).to.equal(resUtils.httpStatus.ok);
            expect(args[2]).to.be.an.instanceof(Array);
            expect(args[2][0]).to.be.an.instanceof(CardSummaryWrapper);
            expect(args[2][0].delegate).to.equal(card1);
            expect(args[2][1]).to.be.an.instanceof(CardSummaryWrapper);
            expect(args[2][1].delegate).to.equal(card2);
          });
      });
    });

    context('when find yields an error', () => {
      var error = new Error('error finding Cards');

      beforeEach(() => {
        sandbox.stub(resourceHelpers, 'allCardsForUser').rejects(error);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.cardSummariesForUser(req, res)
          .then(() => {

            expect(errJsonRes).to.have.been.calledWith(res, error);
          });
      });
    });
  });

  describe('#cardIdsForDeck', () => {
    var deckId = 'asdf1234'
      , userId = '10'
      , appId = 'appId'
      , deckFindStub
      ;

    beforeEach(() => {
      req = {
        params: {
          deckId: deckId,
          userId: userId
        },
        appId: appId
      };

      deckFindStub = sandbox.stub(Deck, 'findOne');
    });

    context('when the deck exists', () => {
      var fakeDeck;

      beforeEach(() => {
        fakeDeck = sandbox.stub();
        fakeDeck.cards = sandbox.stub();

        deckFindStub
          .withArgs({ userId: userId, _id: deckId, appId: appId })
          .yields(null, fakeDeck);
      });

      context('when the deck has cards in it', () => {
        var card1 = { _id: 10 }
          , card2 = { _id: 20 }
          ;

        beforeEach(() => {
          fakeDeck.cards.yields(null, [card1, card2]);

          cardRoutes.cardIdsForDeck(req, res);
        });

        it('calls jsonRes with an Array containing the card ids', () => {
          expect(jsonRes).to.have.been.calledOnce.calledWith(
            res,
            resUtils.httpStatus.ok,
            [ card1._id, card2._id ]
          );
        });
      });

      context("when the deck doesn't have cards in it", () => {
        beforeEach(() => {
          fakeDeck.cards.yields(null, []);
          cardRoutes.cardIdsForDeck(req, res);
        });

        it('calls jsonRes with an emptyArray', () => {
          expect(jsonRes).to.have.been.calledOnce.calledWith(
            res,
            resUtils.httpStatus.ok,
            []
          );
        });
      });

      context("when finding the deck's cards yields an error", () => {
        var error = new Error('error finding deck cards');

        beforeEach(() => {
          fakeDeck.cards.yields(error);

          cardRoutes.cardIdsForDeck(req, res);
        });

        it('calls errJsonRes with the error', () => {
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        });
      });
    });

    context("when the deck doesn't exist", () => {
      beforeEach(() => {
        deckFindStub.yields(null, null);

        cardRoutes.cardIdsForDeck(req, res);
      });

      it('calls jsonRes with not found status and message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: deckNotFoundMessage(deckId, userId) }
        );
      });
    });

    context('when finding the deck yields an error', () => {
      var error = new Error('error finding deck')

      beforeEach(() => {
        deckFindStub
          .withArgs({ userId: userId, _id: deckId, appId: appId })
          .yields(error);

        cardRoutes.cardIdsForDeck(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });
  });

  describe('#getCard', () => {
    var userId = 1
      , cardId = '1234adsf'
      , appId = 'appId'
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          cardId: cardId
        },
        appId: appId
      };
    });

    context('when the card exists', () => {
      var card = { _id: cardId, foo: 'bar' };

      beforeEach(() => {
        sandbox.stub(resourceHelpers, 'cardForUser').resolves(card);
      });

      it('calls jsonRes with the wrapped card', () => {
        cardRoutes.getCard(req, res)
          .then(() => {
            var args;

            expect(jsonRes).to.have.been.calledOnce;
            expect(resourceHelpers.cardForUser).to.have.been.calledOnce.calledWith(appId, userId, cardId)

            args = jsonRes.getCall(0).args;

            expect(args[0]).to.equal(res);
            expect(args[1]).to.equal(resUtils.httpStatus.ok);
            expect(args[2]).to.be.an.instanceof(MongooseWrapper);
            expect(args[2].delegate).to.equal(card);
          });
      });
    });

    context("when the card doesn't exist", () => {
      beforeEach(() => {
        sandbox.stub(resourceHelpers, 'cardForUser').resolves(null)
      });

      it('calls jsonRes with not found status and message', () => {
        cardRoutes.getCard(req, res)
          .then(() => {
            expect(jsonRes).to.have.been.calledOnce.calledWith(
              res,
              resUtils.httpStatus.notFound,
              { msg: cardNotFoundMessage(cardId, userId) }
            );
            expect(resourceHelpers.cardForUser).to.have.been.calledOnce.calledWith(appId, userId, cardId);
          });
      });
    });

    context('when finding the card yields an error', () => {
      var error = new Error('error finding card');

      beforeEach(() => {
        sandbox.stub(resourceHelpers, 'cardForUser').rejects(error);
      });

      it('calls errJsonRes with the error', () => {
        cardRoutes.getCard(req, res)
          .then(() => {
            expect(resourceHelpers.cardForUser).to.have.been.calledOnce.calledWith(appId, userId, cardId);
            expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
          });
      });
    });
  });

  describe('#deleteCard', () => {
    var findOneAndRemove
      , userId = 1
      , cardId = 'asdf1234'
      , appId = 'appId'
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          cardId: cardId
        },
        appId: appId
      };

      findOneAndRemove = sandbox.stub(Card, 'findOneAndRemove')
        .withArgs({
          userId: userId,
          appId: appId,
          _id: cardId
        });
    });

    context('when the card is found', () => {
      var fakeCard = { _id: cardId, foo: 'bar' };

      beforeEach(() => {
        findOneAndRemove.yields(null, fakeCard);

        cardRoutes.deleteCard(req, res);
      });

      it('calls jsonRes with ok status and message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          { msg: 'Card ' + cardId + ' belonging to user ' + userId + ' deleted' }
        );
      });
    });

    context("when the card isn't found", () => {
      beforeEach(() => {
        findOneAndRemove.yields(null, null);

        cardRoutes.deleteCard(req, res);
      });

      it('calls jsonRes with not found status and message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: cardNotFoundMessage(cardId, userId) }
        );
      });
    });

    context('when finding and deleting the card yields an error', () => {
      var error = new Error('error finding and deleting card');

      beforeEach(() => {
        findOneAndRemove.yields(error);

        cardRoutes.deleteCard(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });
  });

  describe('#createDeck', () => {
    var deckCreate
      , fakeDeck = { its: 'a deck'}
      , appId = 'appId'
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: 1
        },
        appId: appId,
        body: { foo: 'bar' }
      };

      deckCreate = sandbox.stub(Deck, 'create');
    });

    context('when deck is successfully created', () => {
      beforeEach(() => {
        deckCreate.yields(null, fakeDeck);
        cardRoutes.createDeck(req, res);
      });

      it('calls jsonRes with status created and the new wrapped deck', () => {
        var args;

        expect(deckCreate).to.have.been.calledWith({
          userId: 1,
          foo: 'bar',
          appId: appId
        });

        expect(jsonRes).to.have.been.calledOnce;
        args = jsonRes.getCall(0).args;

        expect(args[0]).to.equal(res);
        expect(args[1]).to.equal(resUtils.httpStatus.created);
        expect(args[2].delegate).to.equal(fakeDeck);
      });
    });

    context('when deck creation fails', () => {
      var error = new Error('failed to create Deck');

      beforeEach(() => {
        deckCreate.yields(error);
        cardRoutes.createDeck(req, res);
      });

      it('calls handleModelErr with the error', () => {
        expect(handleModelErr).to.have.been.calledOnce.calledWith(res, error);
        expect(jsonRes).not.to.have.been.called;
      });
    });
  });

  describe('#decksForUser', () => {
    var userId = 1
      , appId = appId
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId
        },
        appId: appId
      };
    });

    context('when there are decks belonging to the user', () => {
      var deck1 = { _id: 1 }
        , deck2 = { _id: 5 }
        ;

      beforeEach(() => {
        sandbox.stub(resourceHelpers, 'allDecksForUser').resolves([deck1, deck2]);
      });

      it('calls jsonRes with the wrapped decks', () => {
        return cardRoutes.decksForUser(req, res).then(() => {
          var args;

          expect(resourceHelpers.allDecksForUser).to.have.been.calledOnce.calledWith(appId, userId);
          expect(jsonRes).to.have.been.calledOnce;
          args = jsonRes.getCall(0).args;
          expect(args.length).to.equal(3);
          expect(args[0]).to.equal(res);
          expect(args[1]).to.equal(resUtils.httpStatus.ok);
          expect(args[2]).to.be.an.instanceof(Array);
          expect(args[2][0]).to.be.an.instanceof(MongooseWrapper);
          expect(args[2][0].delegate).to.equal(deck1);
          expect(args[2][1]).to.be.an.instanceof(MongooseWrapper);
          expect(args[2][1].delegate).to.equal(deck2);
        });
      });
    });

    context("when there aren't decks belonging to the user", () => {
      beforeEach(() => {
        sandbox.stub(resourceHelpers, 'allDecksForUser').resolves([]);
      });

      it('calls jsonRes with an empty Array', () => {
        return cardRoutes.decksForUser(req, res).then(() => {
          expect(jsonRes).to.have.been.calledOnce.calledWith(
            res,
            resUtils.httpStatus.ok,
            []
          );
          expect(resourceHelpers.allDecksForUser).to.have.been.calledOnce.calledWith(appId, userId);
        });
      });
    });

    context('when finding user decks yields an error', () => {
      var error = new Error('Error finding deck');

      beforeEach(() => {
        sandbox.stub(resourceHelpers, 'allDecksForUser').rejects(error);
      });

      it('calls errJsonRes with the error', () => {
        cardRoutes.decksForUser(req, res).then(() => {
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
          expect(resourceHelpers.allDecksForUser).to.have.been.calledOnce.calledWith(appId, userId);

        });
      });
    });
  });

  describe('#deleteDeck', () => {
    var findOneAndRemove
      , userId = 1
      , deckId = 'qwer1234'
      , appId = 'appId'
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          deckId: deckId
        },
        appId: appId
      };

      findOneAndRemove = sandbox.stub(Deck, 'findOneAndRemove')
        .withArgs({
          userId: userId,
          appId: appId,
          _id: deckId
        });
    });

    context('when the deck is successfully found and deleted', () => {
      var fakeDeck = { _id: deckId }
        , cardRemove
        ;

      beforeEach(() => {
        findOneAndRemove.yields(null, fakeDeck);

        cardRemove = sandbox.stub(Card, 'remove')
          .withArgs({ _deck: deckId })
          .yields(null);

        cardRoutes.deleteDeck(req, res);
      });

      it('calls jsonRes with ok status and message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          { msg: 'Deck ' + deckId + ' belonging to user ' + userId + ' deleted' }
        );
      });
    });

    context("when the deck isn't found", () => {
      beforeEach(() => {
        findOneAndRemove.yields(null, null);

        cardRoutes.deleteDeck(req, res);
      });

      it('calls jsonRes with not found status and message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: deckNotFoundMessage(deckId, userId) }
        );
      });
    });

    context('when finding and deleting the deck yields an error', () => {
      var error = new Error('error finding and deleting deck');

      beforeEach(() => {
        findOneAndRemove.yields(error);

        cardRoutes.deleteDeck(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });
  });

  describe('#cardSvg', () => {
    var cardId = 'asdf1234'
      , userId = 5
      , appId = 'appId'
      , logger = { log: 'log' }
      ;

    beforeEach(() => {
      req = {
        params: {
          cardId: cardId,
          userId: userId
        },
        appId: appId,
        log: logger
      };
    });

    beforeEach(() => {
      sandbox.stub(resourceHelpers, 'cardForUser')
    });

    context('when the Card is found', () => {
      var fakeCard = { foo: 'bar' }
        , svgCacheGet
        ;

      beforeEach(() => {
        svgCacheGet = sandbox.stub(cardSvgCache, 'get')
          .withArgs(fakeCard, logger);
        resourceHelpers.cardForUser.resolves(fakeCard);
      });

      context('when cardSvgCache yields an error', () => {
        var error = new Error('Error getting Card SVG');

        beforeEach(() => {
          svgCacheGet.yields(error);
        });

        it('calls errJsonRes with the error', () => {
          return cardRoutes.cardSvg(req, res).then(() => {
            expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
          });
        });
      });

      context('when cardSvgCache yields a result', () => {
        var buffer;

        beforeEach(() => {
          buffer = sandbox.stub();
          svgCacheGet.yields(null, buffer);

          res.setHeader = sandbox.spy();
          res.send = sandbox.spy();
        });

        it('sets the Content-Type header and calls send with the buffer', () => {
          return cardRoutes.cardSvg(req, res).then(() => {
            expect(res.setHeader).to.have.been.calledWith('Content-Type', 'image/svg+xml');
            expect(res.send).to.have.been.calledOnce.calledWith(buffer);
          })
        });
      });
    });

    context("when the Card isn't found", () => {
      beforeEach(() => {
        resourceHelpers.cardForUser.resolves(null);
      });

      it('calls jsonRes with not found message and status', () => {
        return cardRoutes.cardSvg(req, res).then(() => {
          expect(jsonRes).to.have.been.calledOnce.calledWith(
            res,
            resUtils.httpStatus.notFound,
            { msg: cardNotFoundMessage(cardId, userId) }
          );
        });
      });
    });

    context('when finding the Card yields an error', () => {
      var error = new Error('error finding card');

      beforeEach(() => {
        resourceHelpers.cardForUser.rejects(error);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.cardSvg(req, res).then(() => {
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        });
      });
    });
  });

  describe('#copyCard', () => {
    var savedCard
      , cardId = 'qwerty'
      , newId = 'ytrewq'
      , userId = 1234
      , appId = 'app'
      ;

    beforeEach(() => {
      sandbox.stub(resourceHelpers, 'cardForUser');
      savedCard = null;
    });

    context('when the card is found', () => {
      var card
        ;

      beforeEach(() => {
        sandbox.stub(mongoose.Types, 'ObjectId').returns(newId);
        card = {
          _id: cardId,
          version: 5,
          isNew: false,
          _deck: {
            id: 'foo'
          }
        };
        card.save = sandbox.stub();
        resourceHelpers.cardForUser.resolves(card);
      });

      function verifySavedCard(deck) {
        expect(savedCard.version).to.equal(0);
        expect(savedCard.isNew).to.be.true;
        expect(savedCard._id).to.equal(newId);

        if (deck) {
          expect(savedCard._deck).to.eql(deck);
        } else {
          expect(savedCard._deck).not.to.exist;
        }
      }

      function itBehavesLikeCardFound(deck) {
        it('calls resourceHelpers.cardForUser with the expected parameters', () => {
          return cardRoutes.copyCard(req, res).then(() => {
            expect(resourceHelpers.cardForUser).to.have.been.calledOnce.calledWith(
              appId, userId, cardId);
          });
        });

        context('when save is successful', () => {
          beforeEach(() => {
            card.save.callsFake(() => {
              savedCard = JSON.parse(JSON.stringify(card));
              return Promise.resolve(savedCard);
            })
          });


          it('calls jsonRes with ok message and status', () => {
            return cardRoutes.copyCard(req, res).then(() => {
              verifySavedCard(deck);
              expect(jsonRes).to.have.been.calledOnce.calledWith(
                res,
                resUtils.httpStatus.ok,
                { status: "ok" }
              );
            });
          });
        });

        context('when save yields an error', () => {
          var err = new Error('failed to save document');

          beforeEach(() => {
            resourceHelpers.cardForUser.rejects(err);
          });

          it('calls errJsonRes with the error', () => {
            return cardRoutes.copyCard(req, res).then(() => {
              expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err);
            });
          });
        });
      }

      context('when deckId is missing from the request', () => {
        beforeEach(() => {
          req = {
            params: {
              userId: userId,
              cardId: cardId
            },
            body: {},
            appId: appId
          }
        });

        itBehavesLikeCardFound(null);
      });

      context('when there is deckId in the request', () => {
        var deckId = 'deckid';

        beforeEach(() => {
          req = {
            params: {
              userId: userId,
              cardId: cardId,
            },
            body: {
              deckId: deckId
            },
            appId: appId
          };

          sandbox.stub(resourceHelpers, 'deckForUser');
        });

        it('calls deckForUser with the correct options', () => {
          cardRoutes.copyCard(req, res);
          expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(appId, userId, deckId);
        });

        context('when deckForUser is successful', () => {
          var deck = {
            id: deckId
          };

          beforeEach(() => {
            resourceHelpers.deckForUser.resolves(deck);
          });

          it('calls deckForUser with the correct options', () => {
            return cardRoutes.copyCard(req, res).then(() => {
              expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(
                appId, userId, deckId); 
            });
          });

          itBehavesLikeCardFound(deck);
        });

        context('when deckForUser yields an error', () => {
          var err = new Error('Deck.findOne failed');

          beforeEach(() => {
            resourceHelpers.deckForUser.rejects(err);
          });

          it('calls deckForUser with the correct options', () => {
            return cardRoutes.copyCard(req, res).then(() => {
              expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(
                appId, userId, deckId); 
            });
          });

          it('calls errJsonRes with the error', () => {
            return cardRoutes.copyCard(req, res).then(() => {
              expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err);
            });
          });
        });

        context('when deckForUser resolves with a null result', () => {
          beforeEach(() => {
            resourceHelpers.deckForUser.resolves(null);
          });

          it('sends "deck not found" response', () => {
            return cardRoutes.copyCard(req, res).then(() => {
              expectDeckNotFoundResponse(deckId, userId);
            });
          });
        });
      });
    });

    context('when cardForUser yields an error', () => {
      var err = new Error('cardForUser failed');

      beforeEach(() => {
        resourceHelpers.cardForUser.rejects(err);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.copyCard(req, res).then(() => {
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err);
        });
      });
    });

    context('when cardForUser yields a null result', () => {
      beforeEach(() => {
        req.body = {};
        resourceHelpers.cardForUser.resolves(null);
      });

      it('sends a "card not found" response', () => {
        return cardRoutes.copyCard(req, res).then(() => {
          expectCardNotFoundResponse(cardId, userId);
        });
      });
    });
  });

  /*
  describe('#userCardsWithTaxonId', () => {
    var userId = 'userId'
      , taxonId = 12345
      , appId
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          taxonId: taxonId
        },
        appId: appId
      }
      sandbox.stub(Card, 'find')
    });

    it('calls find with the expected parameters', () => {
      cardRoutes.userCardsWithTaxonId(req, res);
      expect(Card.find).to.have.been.calledOnce.calledWith({
        templateParams: {
          speciesId: taxonId
        },
        userId: userId,
        appId: appId
      });
    });

    context('when there are cards that belong to the user with the same taxonId', () => {
      var card1Id = 'card1id'
        , card2Id = 'card2id'
        , card1 = {
            _id: card1Id
          }
        , card2 = {
            _id: card2Id
          }
        ;

      beforeEach(() => {
        Card.find.yields(null, [
          card1,
          card2
        ]);

        cardRoutes.userCardsWithTaxonId(req, res);
      });

      it('calls jsonRes with ok status and an array containing the card ids', () => {
        expect(resUtils.jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          [
            card1Id,
            card2Id
          ]
        );
      });
    });

    context('when Card.find yields an error', () => {
      var err = new Error('Card.find failed');

      beforeEach(() => {
        Card.find.yields(err);

        cardRoutes.userCardsWithTaxonId(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(resUtils.errJsonRes).to.have.been.calledOnce.calledWith(res, err);
      });
    });
  });
  */

  describe('#createDeckPdf', () => {
    var userId = 'userId'
      , appId = 'appId'
      , deckId = 'deckId'
      , req
      ;
    
    beforeEach(() => {
      sandbox.stub(resourceHelpers, 'deckForUser');
      req = {
        params: {
          userId: userId
        }, 
        body: {
          deckId: deckId
        },
        appId: appId
      }
    });

    context('when the deck is found', () => {
      var deck = { name: 'deckitydeck' };

      beforeEach(() => {
        deck.cards = sandbox.stub();
        resourceHelpers.deckForUser.resolves(deck);
      });

      context('when there are no cards in the deck', () => {
        beforeEach(() => {
          deck.cards.yields(null, []);
        });

        it('returns a "not found" response', () => {
          return cardRoutes.createDeckPdf(req, res).then(() => {
            expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(appId, userId, deckId);
            expect(jsonRes).to.have.been.calledOnce.calledWith(res, resUtils.httpStatus.notFound, { msg: 'No cards found in deck' });
          });
        });
      });

      context('when there are cards in the deck', () => {
        var cards = [
              { id: 'card1' },
              { id: 'card2' }
            ]
          , jobId = 'jobid'
          ;

        beforeEach(() => {
          deck.cards.yields(null, cards);
          sandbox.stub(deckPdfMaker, 'startJob').returns(jobId);
        });

        it('starts a pdf job and responds with its id', () => {
          return cardRoutes.createDeckPdf(req, res).then(() => {
            expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(appId, userId, deckId);
            expect(jsonRes).to.have.been.calledOnce
              .calledWith(res, resUtils.httpStatus.ok, { jobId: jobId });
          });
        })
      });

      context('when deck.cards yields an error', () => {
        var err = new Error('error in deck.cards');

        beforeEach(() => {
          deck.cards.yields(err);
        });

        it('calls errJsonRes with the error', () => {
          return cardRoutes.createDeckPdf(req, res).then(() => {
            expect(resourceHelpers.deckForUser).to.have.been.calledOnce
              .calledWith(appId, userId, deckId);
            expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err);
          });
        });
      });
    });
    
    context('when the deck is not found', () => {
      beforeEach(() => {
        resourceHelpers.deckForUser.resolves(null);
      });

      it('responds with "deck not found"', () => {
        return cardRoutes.createDeckPdf(req, res).then(() => {
          expect(resourceHelpers.deckForUser).to.have.been.calledOnce
          expectDeckNotFoundResponse(deckId, userId);
        });
      });
    });

    context('when finding the deck results in an error', () => {
      var err = new Error('error in deckForUser');

      beforeEach(() => {
        resourceHelpers.deckForUser.rejects(err);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.createDeckPdf(req, res).then(() => {
          expect(resourceHelpers.deckForUser).to.have.been.calledOnce
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err);
        });
      });
    });
  });

  describe('#deckPdfResult', () => {
    var cardBack = {
          name: 'default'
        }
      , jobId = 'pdfJobId'
      , req = {
          params: {
            id: jobId
          }
        }
      ;

    beforeEach(() => {
      res.setHeader = sandbox.spy();
      res.log = {
        error: sandbox.spy()
      };
      sandbox.stub(cardBackStore, 'get').returns(cardBack);
      sandbox.stub(deckPdfMaker, 'pipePdf');
    });

    it('sets the Content-Type header', () => {
      cardRoutes.deckPdfResult(req, res);
      expect(res.setHeader).to.have.been.calledOnce.calledWith('Content-Type', 'application/pdf');
    });

    it('calls cardBackStore.get with the name "default"', () => {
      cardRoutes.deckPdfResult(req, res);
      expect(cardBackStore.get).to.have.been.calledOnce.calledWith('default');
    });

    it('calls deckPdfMaker.pipePdf with the correct parameters', () => {
      cardRoutes.deckPdfResult(req, res);
      expect(deckPdfMaker.pipePdf).to.have.been.calledOnce.calledWith(jobId, res, PDFDocument, cardBack);
    });

    context('when deckPdfMaker.pipePdf throws an error', () => {
      var err = new Error('failed to pipePdf');

      beforeEach(() => {
        deckPdfMaker.pipePdf.throws(err) 
      });

      it('calls jsonRes with not found message and status', () => {
        cardRoutes.deckPdfResult(req, res);
        expect(resUtils.jsonRes).to.have.been.calledOnce.
          calledWith(res, resUtils.httpStatus.notFound, {
            msg: 'Results of job pdfJobId not found'
          });
      });

      it('logs the error', () => {
        cardRoutes.deckPdfResult(req, res);
        expect(res.log.error).to.have.been.calledOnce
          .calledWith({ err: err }, 'Failed to generate PDF for job pdfJobId');
      });
    });
  });

  describe('#populateDeckFromCollection', () => {
    var deckId = 'deckid'
      , userId = 5
      , appId = 'appId'
      , locale = 'fr'
      , colId = 'colid'
      , log = {
          its: 'alogger'
        }
      , req
      ;

    beforeEach(() => {
      req = {
        params: {
          deckId: deckId,
          userId: userId,
        },
        body: {
          colId: colId
        },
        appId: appId,
        locale: locale,
        log: log
      };

      sandbox.stub(resourceHelpers, 'deckForUser');
    });

    context('when colId is missing from the request body', () => {
      beforeEach(() => {
        delete req.body.colId;
      });

      it('sends a badrequest response', () => {
        return cardRoutes.populateDeckFromCollection(req, res)
          .then(() => {
            expect(jsonRes).to.have.been.calledOnce.calledWith(res, 
              resUtils.httpStatus.badRequest, {
                msg: 'colId missing from request body'
              }
            );
          });
      });
    });

    context('when the deck is found', () => {
      var deck = {
        name: 'deck!'
      }

      beforeEach(() => {
        resourceHelpers.deckForUser.resolves(deck);
        sandbox.stub(collectionCardCreator, 'createJob');
      });

      context('when createJob succeeds', () => {
        var jobId = 'jobid';

        beforeEach(() => {
          collectionCardCreator.createJob.resolves(jobId); 
        });

        it('responds with the job id', () => {
          return cardRoutes.populateDeckFromCollection(req, res)
            .then(() => {
              expect(resourceHelpers.deckForUser).to.have.been.calledOnce
                .calledWith(appId, userId, deckId);
              expect(collectionCardCreator.createJob).to.have.been.calledOnce
                .calledWith(appId, userId, locale, deck, colId, log);
              expect(jsonRes).to.have.been.calledOnce.calledWith(res, 
                resUtils.httpStatus.ok, { jobId: jobId });
            });
        });
      });

      context('when createJob results in an error', () => {
        var err = new Error('createJob failed');

        beforeEach(() => {
          collectionCardCreator.createJob.rejects(err);
        });

        it('calls errJsonRes with the error', () => {
          return cardRoutes.populateDeckFromCollection(req, res)
            .then(() => {
              expect(resourceHelpers.deckForUser).to.have.been.calledOnce
                .calledWith(appId, userId, deckId);
              expect(collectionCardCreator.createJob).to.have.been.calledOnce
                .calledWith(appId, userId, locale, deck, colId, log);
              expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err); 
            });
        });
      });
    });

    context('when the deck is not found', () => {
      beforeEach(() => {
        resourceHelpers.deckForUser.resolves(null);
      });

      it('sends a "not found" code and message', () => {
        return cardRoutes.populateDeckFromCollection(req, res) 
          .then(() => {
            expect(resourceHelpers.deckForUser).to.have.been.calledOnce
              .calledWith(appId, userId, deckId);
            expect(jsonRes).to.have.been.calledOnce.calledWith(res, 
              resUtils.httpStatus.notFound, {
                msg: 'Deck deckid belonging to user 5 not found'
              });
          });
      });
    });

    context('when finding the deck results in an error', () => {
      var err = new Error('error in deckForUser');

      beforeEach(() => {
        resourceHelpers.deckForUser.rejects(err);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.populateDeckFromCollection(req, res)
          .then(() => {
            expect(resourceHelpers.deckForUser).to.have.been.calledOnce
              .calledWith(appId, userId, deckId);
            expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err);
          });
      });
    });
  });

  describe('#setDeckDesc', () => {
    var appId = 'appId'
      , userId = 'userId'
      , deckId = 'deckId'
      , desc = 'Deck description'
      , req
      ;

    beforeEach(() => {
      req = {
        appId: appId,
        body: desc,
        params: {
          userId: userId,
          deckId: deckId
        }
      }
      sandbox.stub(resourceHelpers, 'deckForUser');
    });

    context('when the deck is found', () => {
      var deck = {
            name: 'thedeck'
          } 
        ;

      beforeEach(() => {
        resourceHelpers.deckForUser.resolves(deck);
        deck.save = sandbox.stub().callsFake(() => {
          expect(deck.desc).to.eql(desc);
          return Promise.resolve(deck);
        });
      });

      it('sets the description, saves it, and responds with "ok"', () => {
        return cardRoutes.setDeckDesc(req, res).then(() => {
          expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(appId, userId, deckId);
          expect(deck.save).to.have.been.calledOnce;
          expect(jsonRes).to.have.been.calledOnce.calledWith(res, resUtils.httpStatus.ok, { status: 'ok' });
        });
      });
    });

    context('when the deck is not found', () => {
      beforeEach(() => {
        resourceHelpers.deckForUser.resolves(null);
      });

      it('responds with "deck not found"', () => {
        return cardRoutes.setDeckDesc(req, res).then(() => {
          expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(appId, userId, deckId);
          expectDeckNotFoundResponse(deckId, userId);
        });
      });
    });

    context('when finding the deck yields an error', () => {
      var err = new Error('error in deckForUser');

      beforeEach(() => {
        resourceHelpers.deckForUser.rejects(err);
      });

      it('calls errJsonRes with the error', () => {
        return cardRoutes.setDeckDesc(req, res).then(() => {
          expect(resourceHelpers.deckForUser).to.have.been.calledOnce.calledWith(appId, userId, deckId);
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, err);
        });
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  function itSendsCardNotFoundResponse(cardId, userId) {
    it('sends card not found response', () => {
      expectCardNotFoundResponse(cardId, userId);
    });
  }

  function expectCardNotFoundResponse(cardId, userId) {
    expect(resUtils.jsonRes).to.have.been.calledOnce.calledWith(
      res,
      resUtils.httpStatus.notFound,
      { msg: cardNotFoundMessage(cardId, userId) }
    );
  }

  function itSendsDeckNotFoundResponse(deckId, userId) {
    it('sends deck not found response', () => {
      expectDeckNotFoundResponse(deckId, userId);
    });
  }

  function expectDeckNotFoundResponse(deckId, userId) {
    expect(resUtils.jsonRes).to.have.been.calledOnce.calledWith(
      res,
      resUtils.httpStatus.notFound,
      { msg: deckNotFoundMessage(deckId, userId) }
    );
  }

  function cardNotFoundMessage(cardId, userId) {
    return 'Card ' + cardId + ' belonging to user ' + userId + ' not found';
  }

  function deckNotFoundMessage(deckId, userId) {
    return 'Deck ' + deckId + ' belonging to user ' + userId + ' not found';
  }
});
