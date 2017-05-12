var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var deck = require('_/models/deck')
  , deckRoutes = require('_/routes/decks')
  , resUtils = require('_/routes/util/res-utils')
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

  afterEach(() => {
    sandbox.restore();
  });
});
