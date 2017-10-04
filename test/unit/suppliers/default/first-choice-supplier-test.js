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
        choices = [{text: 'foo', choiceKey: 'key'}];

        firstChoiceSupplier.supply({}, {}, choices, {}, cb);
      });

      it('returns the choice key of the choice', () => {
        expect(cb).to.have.been.calledWith(null, null, 'key');
      });
    });

    context('when there are multiple choices', () => {
      beforeEach(() => {
        choices = [
          {text: 'foo', choiceKey: 'key'},
          {text: 'bar', choiceKey: 'wrong1'},
          {text: 'baz', choiceKey: 'wrong2'}
        ];

        firstChoiceSupplier.supply({}, {}, choices, {}, cb);
      });

      it('returns the choice key of the first', () => {
        expect(cb).to.have.been.calledWith(null, null, 'key');
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
