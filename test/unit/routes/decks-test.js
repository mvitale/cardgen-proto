var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var sinonMongoose = require('sinon-mongoose');

var deck = require('_/models/deck')
  , deckRoutes = require('_/routes/decks')
  , resUtils = require('_/routes/util/res-utils')
  , MongooseWrapper = require('_/api-wrappers/mongoose-wrapper')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('decks', () => {
  var req
    , res = {}
    , jsonRes
    , errJsonRes
    ;

  beforeEach(() => {
    jsonRes = sandbox.stub(resUtils, 'jsonRes');
    errJsonRes = sandbox.stub(resUtils, 'errJsonRes');
  });

  describe('#createDeck', () => {
    var deckCreate
      , fakeDeck = { its: 'a deck'}
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: 1
        },
        body: { foo: 'bar' }
      };

      deckCreate = sandbox.stub(deck.Deck, 'create');
    });

    context('when deck is successfully created', () => {
      beforeEach(() => {
        deckCreate.yields(null, fakeDeck);
        deckRoutes.createDeck(req, res);
      });

      it('calls jsonRes with status created and the new wrapped deck', () => {
        var args;

        expect(deckCreate).to.have.been.calledWith({
          userId: 1,
          foo: 'bar'
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
        deckRoutes.createDeck(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        expect(jsonRes).not.to.have.been.called;
      });
    });
  });

  describe('#decksForUser', () => {
    var deckFind
      , userId = 1
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId
        }
      };

      deckFind = sandbox.mock(deck.Deck)
        .expects('find').withArgs({ userId: userId })
        .chain('sort').withArgs('-_id')
        .chain('exec');
    });

    context('when there are decks belonging to the user', () => {
      var deck1 = { _id: 1 }
        , deck2 = { _id: 5 }
        ;

      beforeEach(() => {
        deckFind.yields(null, [ deck1, deck2 ]);

        deckRoutes.decksForUser(req, res);
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

        deckRoutes.decksForUser(req, res);
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
        deckRoutes.decksForUser(req, res);
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
