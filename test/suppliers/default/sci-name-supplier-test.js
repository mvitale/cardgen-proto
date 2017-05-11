var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var sciNameSupplier =
  require('_/suppliers/default/sci-name-supplier');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('sci-name-supplier', () => {
  describe('#supply', () => {
    var apiResults
      , cb
      ;

    beforeEach(() => {
      cb = sinon.spy();
    });

    context('when apiResults.pages is undefined', () => {
      beforeEach(() => {
        apiResults = {
          foo: 'bar'
        };
      });

      it('throws TypeError', () => {
        expect(() => { sciNameSupplier.supply({}, apiResults, [], cb) })
          .to.throw(TypeError);
      });
    });

    context("when pages result doesn't contain a scientificName", () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            foo: 'bar'
          }
        };

        sciNameSupplier.supply({}, apiResults, [], cb);
      });

      it("returns ''", () => {
        expect(cb).to.have.been.calledWith(null, { text: '' });
      });
    });

    context('when there is a scientificName without a subspecies', () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            scientificName: 'Ailurus fulgens F. G. Cuvier, 1825'
          }
        }

        sciNameSupplier.supply({}, apiResults, [], cb);
      });

      it('returns the species name', () => {
        expect(cb).to.have.been.calledWith(null, { text: 'Ailurus fulgens' });
      });
    });

    context('when there is a scientificName with a subspecies', () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            scientificName: 'Ailurus fulgens fulgens F. G. Cuvier, 1825'
          }
        };

        sciNameSupplier.supply({}, apiResults, [], cb);
      });

      it('returns the species name including the subspecies', () => {
        expect(cb).to.have.been.calledWith(
          null,
          { text: 'Ailurus fulgens fulgens' }
        );
      });
    });

    context('when there is a scientificName with just one word', () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            scientificName: 'foo'
          }
        }

        sciNameSupplier.supply({}, apiResults, [], cb);
      });

      it('returns the word', () => {
        expect(cb).to.have.been.calledWith(null, { text: 'foo' });
      });
    });

    context('when there is an empty scientificName', () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            scientificName: ''
          }
        };

        sciNameSupplier.supply({}, apiResults, [], cb);
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
