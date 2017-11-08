var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , cardBackStore = require('_/card-back-store')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('card-back-store with real dependencies', () => {
  it('returns a result for name "default"', () => {
    cardBackStore.init();
    expect(() => { cardBackStore.get('default') }).to.exist;
  });

  afterEach(() => {
    sandbox.restore();
  });
});


