var reqlib = require('app-root-path').require;
var chai = require('chai');
var sinon = require('sinon');

var sinonChai = require('sinon-chai');
var verrorChai = require('../../helpers/verror-chai');

var expect = chai.expect;
chai.use(sinonChai);
chai.use(verrorChai);

var sandbox = sinon.sandbox.create();

var eolApiCaller = require('_/api-callers/eol-api-caller')
  , speciesDataSupplier = require('_/suppliers/data/species-data-supplier')
  , dataUtils = require('_/data-utils/data-utils')
  , taxonGroup = require('_/suppliers/shared/taxon-group')
  ;

describe('species-data-supplier', () => {
  describe('#supply', () => {
    var getJson
      , cb
      , sciName = 'Procyon lotor'
      , taxonRank = 'Species'
      , taxonRankLower = 'species'
      , pagesResult = {
          taxonConcepts: [
            {
              identifier: 1234,
              scientificName: sciName,
              taxonRank: taxonRank
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
      var ancestors = [{
            foo: 'bar',
            scientificName: 'animalia',
            taxonRank: 'kingdom'
          }, {
            bar: 'foo',
            scientificName: 'Mammalia',
            taxonRank: 'class'
          }]
        , hierarchyResult = {
            ancestors: ancestors
          }
        , images = [{url:
            'foo'}]
        , commonName = 'Red Panda'
        , taxonGroupKeyStub
        ;

      beforeEach(() => {
        getJson.withArgs('pages').yields(null, pagesResult);
        getJson.withArgs('hierarchy_entries').yields(null, hierarchyResult);
        sandbox.stub(dataUtils, 'parseImages')
          .returns(images);
        sandbox.stub(dataUtils, 'parseCommonName')
          .returns(commonName);
        sandbox.stub(taxonGroup, 'lowestTaxonGroupKey').withArgs(sciName, ancestors)
          .returns('mammals');

        // Store in var to verify later that the args are in fact what we
        // expect. Null is too vague a value to rely on the withArgs matching
        // alone
        taxonGroupKeyStub = sandbox.stub(taxonGroup, 'taxonGroupKey').returns(null);
      });

      it('yields the correct result', () => {
        speciesDataSupplier.supply({}, cb);
        expect(cb).to.have.been.calledWith(null, {
          taxon: {
            commonName: commonName,
            scientificName: sciName,
            taxonGroupKey: 'mammals',
            selfTaxonGroupKey: null,
            taxonRank: 'species'
          },
          images: images,
        });
        expect(taxonGroupKeyStub).to.have.been.calledOnce.calledWith(
          taxonRankLower, sciName
        );
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
