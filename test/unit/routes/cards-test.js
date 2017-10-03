var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var sinonMongoose = require('sinon-mongoose');

var cardRoutes = require('_/routes/cards')
  , Card = require('_/models/card')
  , Deck = require('_/models/deck')
  , resUtils = require('_/routes/util/res-utils')
  , MongooseWrapper = require('_/api-wrappers/mongoose-wrapper')
  , CardSummaryWrapper = require('_/api-wrappers/card-summary-wrapper')
  , cardSvgCache = require('_/card-svg-loading-cache')
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
      ;

    beforeEach(() => {
      req = {
        body: {},
        params: {
          userId: 1,
        },
        appId: appId
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
          appId: appId
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
    var findDeck
      , fakeDeck = { deck: true }
      , userId = 1
      , deckId = 2
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

      findDeck = sandbox.stub(Deck, 'findOne');
    });

    context('success pathway', () => {
      beforeEach(() => {
        setUpSuccessCard();
        findDeck.yields(null, fakeDeck);
        cardRoutes.createCardInDeck(req, res);
      });

      it('creates the Card and sets the correct response', () => {
        expect(Card.new).to.have.been.calledWith({
          userId: userId,
          appId: appId,
          _deck: fakeDeck
        });
        verifyCardCreated();
      });
    });

    context('when the deck is not found', () => {
      beforeEach(() => {
        findDeck.yields(null, null);
        cardRoutes.createCardInDeck(req, res);
      });

      it('sets the correct error on the response', () => {
        expect(jsonRes).to.have.been.calledWith(res, resUtils.httpStatus.notFound, {
          msg: 'Deck 2 belonging to user 1 not found'
        });
      });
    });

    context('when Deck.find returns an error', () => {
      var error = new Error('Something went wrong in find');

      beforeEach(() => {
        findDeck.yields(error);
        cardRoutes.createCardInDeck(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledWith(res, error);
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
      , findOne
      , fakeCard = { version: 1 }
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

      findOne = sandbox.stub(Card, 'findOne');
    });

    context('success pathway', () => {
      beforeEach(() => {
        fakeCard.save = sandbox.stub().callsFake((cb) => {
          cb(null, fakeCard);
        });

        findOne.withArgs({ userId: userId, appId: appId, _id: cardId })
          .yields(null, fakeCard);

        cardRoutes.save(req, res);
      });

      it('updates the card and calls jsonRes with the correct arguments', () => {
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

    context('when card is not found', () => {
      beforeEach(() => {
        findOne.yields(null, null);

        cardRoutes.save(req, res);
      });

      it('calls jsonRes with the correct error message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: cardNotFoundMessage(cardId, userId) }
        );
      });
    });

    context('when Card.find yields an error', () => {
      var error = new Error('find error!');

      beforeEach(() =>  {
        findOne.yields(error);

        cardRoutes.save(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        expect(jsonRes).not.to.have.been.called;
      });
    });

    context('when saving card yields an error', () => {
      var error = new Error('failed to save card');

      beforeEach(() => {
        findOne.yields(null, fakeCard);
        fakeCard.save = sandbox.stub().yields(error);

        cardRoutes.save(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        expect(jsonRes).not.to.have.been.called;
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

  describe('#cardSummariesForUser', () => {
    var userId = 1
      , appId = 'appId'
      , cards
      , findMock
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

        findMock = sandbox.mock(Card)
          .expects('find').withArgs({ userId: userId, appId: appId })
          .chain('sort').withArgs('-_id')
          .chain('populate').withArgs('_deck')
          .chain('exec')
          .yields(null, cards)

        cardRoutes.cardSummariesForUser(req, res);
      });

      it('calls jsonRes with an empty Array', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          []);
        findMock.verify();
      });
    });

    context('when the user has cards', () => {
      var card1 = { _id: 3 }
        , card2 = { _id: 5 }
        ;

      beforeEach(() => {
        cards = [ card1, card2 ];

        findMock = sandbox.mock(Card)
          .expects('find').withArgs({ userId: userId, appId: appId })
          .chain('sort').withArgs('-_id')
          .chain('populate').withArgs('_deck')
          .chain('exec')
          .yields(null, cards)

        cardRoutes.cardSummariesForUser(req, res);
      });

      it('calls jsonRes with those cards wrapped', () => {
        var args;

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

        findMock.verify();
      });
    });

    context('when find yields an error', () => {
      var error = new Error('error finding Cards');

      beforeEach(() => {
        findMock = sandbox.mock(Card)
          .expects('find').withArgs({ userId: userId, appId: appId })
          .chain('sort').withArgs('-_id')
          .chain('populate').withArgs('_deck')
          .chain('exec')
          .yields(error)

        cardRoutes.cardSummariesForUser(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledWith(res, error);
        findMock.verify();
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
      , cardFindMock
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          cardId: cardId
        },
        appId: appId
      };

      cardFindMock = sandbox.mock(Card)
        .expects('findOne').withArgs({
            userId: userId,
            _id: cardId,
            appId: appId
        })
        .chain('populate').withArgs('_deck')
        .chain('exec');
     });

    context('when the card exists', () => {
      var card = { _id: cardId, foo: 'bar' };

      beforeEach(() => {
        cardFindMock.yields(null, card);
        cardRoutes.getCard(req, res);
      });

      it('calls jsonRes with the wrapped card', () => {
        var args;

        expect(jsonRes).to.have.been.calledOnce;

        args = jsonRes.getCall(0).args;

        expect(args[0]).to.equal(res);
        expect(args[1]).to.equal(resUtils.httpStatus.ok);
        expect(args[2]).to.be.an.instanceof(MongooseWrapper);
        expect(args[2].delegate).to.equal(card);
      });
    });

    context("when the card doesn't exist", () => {
      beforeEach(() => {
        cardFindMock.yields(null, null);
        cardRoutes.getCard(req, res);
      });

      it('calls jsonRes with not found status and message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: cardNotFoundMessage(cardId, userId) }
        );
      });
    });

    context('when finding the card yields an error', () => {
      var error = new Error('error finding card');

      beforeEach(() => {
        cardFindMock.yields(error);
        cardRoutes.getCard(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
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
    var deckFind
      , userId = 1
      , appId = appId
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId
        },
        appId: appId
      };

      deckFind = sandbox.mock(Deck)
        .expects('find').withArgs({ userId: userId, appId: appId })
        .chain('sort').withArgs('-_id')
        .chain('exec');
    });

    context('when there are decks belonging to the user', () => {
      var deck1 = { _id: 1 }
        , deck2 = { _id: 5 }
        ;

      beforeEach(() => {
        deckFind.yields(null, [ deck1, deck2 ]);

        cardRoutes.decksForUser(req, res);
      });

      it('calls jsonRes with the wrapped decks', () => {
        var args;

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

    context("when there aren't decks belonging to the user", () => {
      beforeEach(() => {
        deckFind.yields(null, []);

        cardRoutes.decksForUser(req, res);
      });

      it('calls jsonRes with an empty Array', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          []
        );
      });
    });

    context('when finding user decks yields an error', () => {
      var error = new Error('Error finding deck');

      beforeEach(() => {
        deckFind.yields(error);
        cardRoutes.decksForUser(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
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
      , findOne
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

      findOne = sandbox.stub(Card, 'findOne')
        .withArgs({
          userId: userId,
          appId: appId,
          _id: cardId
        });
    });

    context('when the Card is found', () => {
      var fakeCard = { foo: 'bar' }
        , svgCacheGet
        ;

      beforeEach(() => {
        svgCacheGet = sandbox.stub(cardSvgCache, 'get')
          .withArgs(fakeCard, logger);

        findOne.yields(null, fakeCard);
      });

      context('when cardSvgCache yields an error', () => {
        var error = new Error('Error getting Card SVG');

        beforeEach(() => {
          svgCacheGet.yields(error);
          cardRoutes.cardSvg(req, res);
        });

        it('calls errJsonRes with the error', () => {
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        });
      });

      context('when cardSvgCache yields a result', () => {
        var buffer;

        beforeEach(() => {
          buffer = sandbox.stub();
          svgCacheGet.yields(null, buffer);

          res.setHeader = sandbox.spy();
          res.send = sandbox.spy();

          cardRoutes.cardSvg(req, res);
        });

        it('sets the Content-Type header and calls send with the buffer', () => {
          expect(res.setHeader).to.have.been.calledWith('Content-Type', 'image/svg+xml');
          expect(res.send).to.have.been.calledOnce.calledWith(buffer);
        });
      });
    });

    context("when the Card isn't found", () => {
      beforeEach(() => {
        findOne.yields(null, null);

        cardRoutes.cardSvg(req, res);
      });

      it('calls jsonRes with not found message and status', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: cardNotFoundMessage(cardId, userId) }
        );
      });
    });

    context('when finding the Card yields an error', () => {
      var error = new Error('error finding card');

      beforeEach(() => {
        findOne.yields(error);

        cardRoutes.cardSvg(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});

function cardNotFoundMessage(cardId, userId) {
  return 'Card ' + cardId + ' belonging to user ' + userId + ' not found';
}

function deckNotFoundMessage(deckId, userId) {
  return 'Deck ' + deckId + ' belonging to user ' + userId + ' not found';
}
