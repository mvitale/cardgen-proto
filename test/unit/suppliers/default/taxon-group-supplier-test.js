var reqlib = require('app-root-path').reqlib;
/*
 * TODO: rewrite with correct dependencies, etc.
var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var taxonGroupSupplier =
  require('_/suppliers/default/taxon-group-supplier');
var util =
  require('_/suppliers/default/util/util');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('taxon-class-supplier', () => {
  describe('#supply', () => {
    var stub
      , cb;

    beforeEach(() => {
      cb = sinon.spy();
      stub = sandbox.stub(util, 'extractClassName');
    });

    context('when the class name is recognized', () => {
      beforeEach(() => {
        stub.returns('Aves');
        taxonGroupSupplier.supply({}, {}, [], cb);
      });

      it('returns the English name for the class', () => {
        expect(cb).to.have.been.calledWith(
          null,
          { text: 'Birds' }
        );
      });
    });

    context("when the class name isn't recognized", () => {
      beforeEach(() => {
        stub.returns('unknownclass');
        taxonGroupSupplier.supply({}, {}, [], cb);
      });

      it("returns ''", () => {
        expect(cb).to.have.been.calledWith(null, { text: '' });
      });
    });

    context('when the class name is blank', () => {
      beforeEach(() => {
        stub.returns('');
        taxonGroupSupplier.supply({}, {}, [], cb);
      });

      it("returns ''", () => {
        expect(cb).to.have.been.calledWith(null, { text: '' });
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
*/
