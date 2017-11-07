var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , fs = require('fs')
  , decache = require('decache')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('card-back-store', () => {
  var path1 = 'images/card_backs/back1.png'
    , path2 = 'images/card_backs/back2.png'
    , buf1 = {
        id: 'back1'
      }
    , buf2 = {
        id: 'back2'
      }
    , cardBackStore
    ;

  beforeEach(() => {
    cardBackStore = require('_/card-back-store');

    sandbox.stub(fs, 'readdirSync').returns([
      path1,
      path2
    ]);

    sandbox.stub(fs, 'readFileSync')
      .withArgs(path1)
      .returns(buf1)
      .withArgs(path2)
      .returns(buf2);
  });

  describe('#init', () => {
    it('works', () => {
      expect(cardBackStore.init).not.to.throw;
    });

    it('makes the expected calls', () => {
      cardBackStore.init();
      expect(fs.readdirSync).to.have.been.calledOnce; // There's not a great way to verify the path it's called with
      expect(fs.readFileSync).to.have.been.calledTwice
        .calledWith(path1)
        .calledWith(path2);
    });

    context('when called twice', () => {
      it('throws a TypeError', () => {
        cardBackStore.init();
        expect(cardBackStore.init).to.throw(TypeError);
      });
    });
  });

  describe('#get', () => {
    beforeEach(() => {
      cardBackStore.init()
    });

    context('when called with a valid name', () => {
      it('returns the correct buffer', () => {
        expect(cardBackStore.get('back1')).to.equal(buf1);
        expect(cardBackStore.get('back2')).to.equal(buf2);
      });
    });

    context('when called with an invalid name', () => {
      it('throws a TypeError', () => {
        expect(() => { cardBackStore.get('invalid') }).to.throw(TypeError);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
    decache('_/card-back-store');
  });
});


