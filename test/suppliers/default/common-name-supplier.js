var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var commonNameSupplier =
  require('../../../suppliers/default/common-name-supplier');

chai.use(sinonChai);

var expect = chai.expect;
var sandbox = sinon.sandbox.create();

describe('common-name-supplier', () => {
  var cb
    , apiResults
    ;

  beforeEach(() => {
    cb = sinon.spy();
  });

  describe('#supply', () => {
    context('when apiResults.pages is missing', () => {
      beforeEach(() => {
        apiResults = {
          foo: 'bar'
        };
      });

      it('throws a TypeError', () => {
        expect(() => { commonNameSupplier.supply({}, apiResults, {}, cb) })
          .to.throw(TypeError);
      });
    });

    context('when apiResults.pages.vernacularNames is missing', () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            foo: 'bar'
          }
        };

        commonNameSupplier.supply({}, apiResults, {}, cb);
      });

      it("returns ''", () => {
        expect(cb).to.have.been.calledWith(null, { text: '' });
      });
    });

    context('when there is an eol_preferred English name present', () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            vernacularNames: [
              {
                language: 'en',
                vernacularName: 'Foo bar'
              },
              {
                language: 'es',
                vernacularName: 'Panda rojo',
                eol_preferred: true
              },
              {
                language: 'en',
                vernacularName: 'red panda',
                eol_preferred: true
              }
            ]
          }
        };

        commonNameSupplier.supply({}, apiResults, {}, cb);
      });

      it('returns it with each word capitalized', () => {
        expect(cb).to.have.been.calledWith(null, { text: 'Red Panda'} );
      });
    });

    context("when there isn't an eol_preferred English value", () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            vernacularNames: [
              {
                language: 'en',
                vernacularName: 'red panda',
              },
              {
                language: 'en',
                vernacularName: 'Foo bar'
              },
            ]
          }
        };

        commonNameSupplier.supply({}, apiResults, {}, cb);
      });

      it('returns the first English value', () => {
        expect(cb).to.have.been.calledWith(null, { text: 'Red Panda' });
      });
    });

    context("when there aren't any English values present", () => {
      beforeEach(() => {
        apiResults = {
          pages: {
            vernacularNames: [
              {
                language: 'es',
                vernacularName: 'panda rojo',
              },
              {
                language: 'fr',
                vernacularName: 'panda rouge'
              },
            ]
          }
        };

        commonNameSupplier.supply({}, apiResults, {}, cb);
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
