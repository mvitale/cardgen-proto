var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , fs = require('fs')
  , decache = require('decache')
  , path = require('path')
  , appRoot = require('app-root-path')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('card-back-store', () => {
  var filename1 = 'back1.png'
    , filename2 = 'back2.png'
    , backsPath = path.join(appRoot.toString(), 'lib', 'images', 'card_backs')
    , path1 = path.join(backsPath, filename1)
    , path2 = path.join(backsPath, filename2)
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
      filename1,
      filename2
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
      expect(fs.readdirSync).to.have.been.calledOnce.calledWith(backsPath);
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
    context('when it is initialized', () => {
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

    context('when called before init', () => {
      it('throws a TypError', () => {
        expect(() => { cardBackStore.get('back1') }).to.throw(TypeError, 'Not initialized - you must call init before this method');
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
    decache('_/card-back-store');
  });
});

