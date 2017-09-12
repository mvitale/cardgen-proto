var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var firstChoiceSupplier =
  require('_/suppliers/default/first-choice-supplier');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('first-choice-supplier', () => {
  describe('#supply', () => {
    var cb
    , choices
    ;

    beforeEach(() => {
      cb = sinon.spy();
    });

    context('when there is one choice', () => {
      beforeEach(() => {
        choices = ['foo'];

        firstChoiceSupplier.supply({}, {}, choices, {}, cb);
      });

      it('returns 0', () => {
        expect(cb).to.have.been.calledWith(null, null, 0);
      });
    });

    context('when there are multiple choices', () => {
      beforeEach(() => {
        choices = ['foo', 'bar', 'baz'];

        firstChoiceSupplier.supply({}, {}, choices, {}, cb);
      });

      it('returns 0', () => {
        expect(cb).to.have.been.calledWith(null, null, 0);
      });
    });

    context('when choices is empty', () => {
      beforeEach(() => {
        choices = [];

        firstChoiceSupplier.supply({}, {}, choices, {}, cb);
      });

      it('returns null', () => {
        expect(cb).to.have.been.calledWith(null, null, null);
      });
    });

    context('when choices is null', () => {
      beforeEach(() => {
        choices = null;
      });

      it('throws TypeError', () => {
        expect(() => { firstChoiceSupplier.supply({}, {}, choices, cb) })
          .to.throw(TypeError);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
