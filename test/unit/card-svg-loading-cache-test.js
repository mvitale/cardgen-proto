var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , decache = require('decache')
  ;

var cardSvgCache
  , generator = require('_/generator')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('card-svg-loading-cache', () => {
  describe('#get', () => {
    var cardId = '1234asdf'
      , cardVersion = 10
      , card = {
          _id: cardId,
          version: cardVersion
        }
      , childLog = {
          info: sinon.stub()
        }
      , reqLog = {
          child: function() {
            return childLog;
          }
        }
      , fakeSvgBuffer = 'itsansvg!'
      , generateSvg
      , cb
      ;

    beforeEach(() => {
      cardSvgCache = require('_/card-svg-loading-cache');
      cb = sinon.spy();
      generateSvg = sandbox.stub(generator, 'generateSvg');
    });

    function yieldsExpectedResult() {
      expect(cb).to.have.been.calledOnce.calledWith(null, fakeSvgBuffer);
    }

    context('when the card is not in the cache', () => {
      context('when generateSvg yields a result', () => {
        beforeEach(() => {
          generateSvg.yields(null, fakeSvgBuffer);
        });

        it('yields the result', () => {
          cardSvgCache.get(card, reqLog, cb);
          yieldsExpectedResult();
        });
      });

      context('when generateSvg yields an error', () => {
        var err = new Error('fail');

        beforeEach(() => {
          generateSvg.yields(err);
        });

        it('yields the error', () => {
          cardSvgCache.get(card, reqLog, cb);
          expect(cb).to.have.been.calledOnce.calledWith(err);
        });
      });
    });

    context('when the card is in the cache', () => {
      beforeEach(() => {
        generateSvg.yields(null, fakeSvgBuffer);
        cardSvgCache.get(card, reqLog, () => {});
        generateSvg.resetHistory();
      });

      it('yields it', () => {
        cardSvgCache.get(card, reqLog, cb);
        expect(generateSvg).not.to.have.been.called;
        yieldsExpectedResult();
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
    decache('_/card-svg-loading-cache');
  });
});
