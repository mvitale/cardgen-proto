var chai = require('chai');
var sinon = require('sinon');

var sinonChai = require('sinon-chai');
var verrorChai = require('../../helpers/verror-chai');

var expect = chai.expect;
chai.use(sinonChai);
chai.use(verrorChai);

var sandbox = sinon.sandbox.create();

var eolApiCaller = require('_/suppliers/api/eol-api-caller');
var speciesDataSupplier = require('_/suppliers/api/species-data-supplier');

describe('species-data-supplier', () => {
  describe('#supply', () => {
    var getJson
      , cb
      , pagesResult = {
          taxonConcepts: [
            {
              identifier: 1234
            },
            {
              identifier: 4321
            }
          ]
        }
      ;

    beforeEach(() => {
      getJson = sandbox.stub(eolApiCaller, 'getJson');
      cb = sinon.spy();
    });

    context('when all calls are successful', () => {

      var hierarchyResult = {
        hierarchy_entries: 'foo'
      };

      beforeEach(() => {
        getJson.withArgs('pages').callsFake((apiName, params, cb) => {
          cb(null, pagesResult);
        });

        getJson.withArgs('hierarchy_entries').callsFake((apiName, params, cb) => {
          cb(null, hierarchyResult);
        });
      });

      it('yields the correct result', () => {
        speciesDataSupplier.supply({}, cb);
        expect(cb).to.have.been.calledWith(null, {
          pages: pagesResult,
          hierarchy_entries: hierarchyResult
        });
      });
    });

    context('when an api call fails', () => {
      function checkApiErrorArgs(cb, apiName) {
        expect(cb).to.have.been.calledWithVerror(apiName + ' call failed: ');
      }

      context('when the pages call fails', () => {
        beforeEach(() => {
          getJson.withArgs('pages').callsFake((apiName, params, cb) => {
            cb(new Error('API call failed'));
          });

          speciesDataSupplier.supply({}, cb);
        });

        it('yields the correct error', () => {
          checkApiErrorArgs(cb, 'pages');
        });
      });

      context('when the hierarchy_entries call fails', () => {
        beforeEach(() => {
          getJson.withArgs('pages').callsFake((apiName, params, cb) => {
            cb(null, pagesResult);
          });

          getJson.withArgs('hierarchy_entries').callsFake((apiName, params, cb) => {
            cb(new Error('API call failed'));
          });

          speciesDataSupplier.supply({}, cb);
        });

        it('yields the correct error', () => {
          checkApiErrorArgs(cb, 'hierarchy_entries');
        });
      });
    });

    context('when the pages call returns an unexpected result', () => {
      context('when there is no taxonConcepts array', () => {
        beforeEach(() => {
          getJson.withArgs('pages').callsFake((apiName, params, cb) => {
            cb(null, {
              foo: 'bar'
            });
          });

          speciesDataSupplier.supply({}, cb);
        });

        it('produces the correct error', () => {
          expect(cb).to.have.been.calledWithVerror(
            'taxonConcepts missing in pages result'
          );
        });
      });

      context('when the taxonConcepts array is empty', () => {
        beforeEach(() => {
          getJson.withArgs('pages').callsFake((apiName, params, cb) => {
            cb(null, {
              taxonConcepts: []
            });
          });

          speciesDataSupplier.supply({}, cb);
        });

        it('produces the correct error', () => {
          expect(cb).to.have.been.calledWithVerror(
            'taxonConcepts empty in pages result'
          );
        });
      });

      context(
        'when there is no identifier in the first taxonConcepts element',
        () => {
          beforeEach(() => {
            getJson.withArgs('pages').callsFake((apiName, params, cb) => {
              cb(null, {
                taxonConcepts: [{ foo: 'bar' }]
              });
            });

            speciesDataSupplier.supply({}, cb);
          });

          it('produces the correct error', () => {
            expect(cb).to.have.been.calledWithVerror(
              'taxonConcepts first element missing identifier'
            );
          });
        }
      );
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
