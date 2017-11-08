var reqlib = require('app-root-path').require;
var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var sciNameSupplier =
  require('_/suppliers/choice/sci-name-supplier');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('sci-name-supplier', () => {
  describe('#supply', () => {
    var data
      , cb
      , locale = 'es'
      ;

    beforeEach(() => {
      cb = sinon.spy();
      data = {
        taxon: {}
      }
    });

    context("when data.taxon doesn't contain a scientificName", () => {
      beforeEach(() => {
        sciNameSupplier.supply({}, data, locale, cb);
      });

      it("yields []", () => {
        expect(cb).to.have.been.calledWith(null, []);
      });
    });

    context('when there is a scientificName without a subspecies', () => {
      beforeEach(() => {
        data.taxon.scientificName = 'Ailurus fulgens F. G. Cuvier, 1825';
        sciNameSupplier.supply({}, data, locale, cb);
      });

      it('yields the species name', () => {
        expect(cb).to.have.been.calledWith(null, [
          { text: 'Ailurus fulgens', choiceKey: 'Ailurus fulgens' }
        ] );
      });
    });

    context('when there is a scientificName with a subspecies', () => {
      beforeEach(() => {
        data.taxon.scientificName = 'Ailurus fulgens fulgens F. G. Cuvier, 1825';
        sciNameSupplier.supply({}, data, locale, cb);
      });

      it('returns the species name including the subspecies', () => {
        expect(cb).to.have.been.calledWith(
          null,
          [{ text: 'Ailurus fulgens fulgens', choiceKey: 'Ailurus fulgens fulgens'}]
        );
      });
    });

    context('when there is a scientificName with just one word', () => {
      beforeEach(() => {
        data.taxon.scientificName = 'foo';
        sciNameSupplier.supply({}, data, locale, cb);
      });

      it('yields the word', () => {
        expect(cb).to.have.been.calledWith(null, [
          { text: 'foo', choiceKey: 'foo'}
        ]);
      });
    });

    context('when there is an empty scientificName', () => {
      beforeEach(() => {
        data.taxon.scientificName = '';
        sciNameSupplier.supply({}, data, locale, cb);
      });

      it("yields []", () => {
        expect(cb).to.have.been.calledWith(null, []);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
