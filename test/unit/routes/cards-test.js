var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var cardRoutes = require('_/routes/cards')
  , card = require('_/models/card')
  , deck = require('_/models/deck')
  , resUtils = require('_/routes/util/res-utils')
  , MongooseWrapper = require('_/api-wrappers/mongoose-wrapper')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('cards', () => {
  var newCardStub
    , stubCard
    , req
    , res = {}
    , jsonRes
    , errJsonRes
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
    newCardStub = sandbox.stub(card, 'new');
    stubCard = sinon.createStubInstance(card.Card);
    newCardStub.returns(stubCard);
    jsonRes = sandbox.stub(resUtils, 'jsonRes');
    errJsonRes = sandbox.stub(resUtils, 'errJsonRes');
  });

  describe('#createCard', () => {
    beforeEach(() => {
      req = {
        body: {},
        params: {
          userId: 1
        }
      }
    });

    context('success pathway', () => {
      beforeEach(() => {
        setUpSuccessCard();
        cardRoutes.createCard(req, res);
      });

      it('creates a Card and sets the correct response', () => {
        var jsonResArgs;

        expect(newCardStub).to.have.been.calledWith({ userId: 1 });
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
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: 1,
          deckId: 2
        }
      };

      findDeck = sandbox.stub(deck.Deck, 'findOne');
    });

    context('success pathway', () => {
      beforeEach(() => {
        setUpSuccessCard();
        findDeck.yields(null, fakeDeck);
        cardRoutes.createCardInDeck(req, res);
      });

      it('creates the Card and sets the correct response', () => {
        expect(card.new).to.have.been.calledWith({
          userId: 1,
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

  describe('#putCardData', () => {
    var userId = 1
      , cardId = 'ABC134'
      , update = { someData: 'foo' }
      , findOne
      , fakeCard = { version: 1 }
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId,
          cardId: cardId
        },
        body: update
      };

      findOne = sandbox.stub(card.Card, 'findOne');
    });

    context('success pathway', () => {
      beforeEach(() => {
        fakeCard.save = sandbox.stub().callsFake((cb) => {
          expect(fakeCard.data).to.equal(update);
          expect(fakeCard.version).to.equal(2);
          cb(null, fakeCard);
        });

        findOne.withArgs({ userId: userId, _id: cardId })
          .yields(null, fakeCard);

        cardRoutes.putCardData(req, res);
      });

      it('updates the card and calls jsonRes with the correct arguments', () => {
        var args;

        expect(fakeCard.data).to.equal(update);
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

        cardRoutes.putCardData(req, res);
      });

      it('calls jsonRes with the correct error message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: 'Card ' + cardId + ' belonging to user ' + userId + ' not found'}
        );
      });
    });

    context('when Card.find yields an error', () => {
      var error = new Error('find error!');

      beforeEach(() =>  {
        findOne.yields(error);

        cardRoutes.putCardData(req, res);
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

        cardRoutes.putCardData(req, res);
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

      findOneCard.withArgs({ _id: cardId, userId: userId })
        .yields(null, fakeCard);
    }

    beforeEach(() => {
      req = {
        params: {
          cardId: cardId,
          userId: userId
        },
        body: deckId
      };

      findOneCard = sandbox.stub(card.Card, 'findOne');
      findOneDeck = sandbox.stub(deck.Deck, 'findOne');
    });

    context('success path', () => {
      var save;

      beforeEach(() => {
        setupFindOneCardSuccess();

        findOneDeck.withArgs({ _id: deckId, userId: userId })
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
        expect(args[2]).to.be.an.instanceof(MongooseWrapper);
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
          { msg: 'Card ' + cardId + ' belonging to user ' + userId + ' not found' }
        );
      });
    });

    context('when card.findOne yields an error', () => {
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
          { msg: 'Deck ' + deckId + ' belonging to user ' + userId + ' not found' }
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
      , findOneCard
      , fakeCard
      ;

    function setupFindOneCardSuccess() {
      fakeCard = { version: 1, _deck: 'foo' };
      fakeCard.save = sandbox.stub().callsFake((cb) => {
        expect(fakeCard._deck).to.equal(null);
        cb(null, fakeCard);
      });

      findOneCard.withArgs({ _id: cardId, userId: userId })
        .yields(null, fakeCard);
    }

    beforeEach(() => {
      req = {
        params: {
          cardId: cardId,
          userId: userId
        }
      };

      findOneCard = sandbox.stub(card.Card, 'findOne');
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
        expect(args[2]).to.be.an.instanceof(MongooseWrapper);
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
          { msg: 'Card ' + cardId + ' belonging to user ' + userId + ' not found' }
        );
      });
    });

    context('when card.findOne yields an error', () => {
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

  afterEach(() => {
    sandbox.restore();
  });
});
