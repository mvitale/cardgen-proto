var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var verrorChai = require('../../helpers/verror-chai');

var expect = chai.expect;
chai.use(sinonChai);
chai.use(verrorChai);

var speciesImagesSupplier =
  require('_/suppliers/choice/species-images-supplier');


var sandbox = sinon.sandbox.create();

describe('species-images-supplier', () => {
  describe('#supply', () => {
    var cb;

    beforeEach(() => {
      cb = sinon.spy();
    });

    context('when apiResults.pages.dataObjects is present', () => {
      var url = 'https://www.eol.org/12345_orig.jpg'
      , fullSzUrl = 'https://www.eol.org/12345_580_360.jpg'
      , thumbUrl = 'https://www.eol.org/12345_130_130.jpg'
      , author = 'John Smith'
      , license = 'http://creativecommons.org/licenses/by/'
      , targetDataType = 'http://purl.org/dc/dcmitype/StillImage'
      , apiResults = {
          pages:  {
            dataObjects: [
              { // Should be parsed
                eolMediaURL: url,
                rightsHolder: author,
                license: license,
                dataType: [ 'foo', targetDataType ]
              },
              { // Missing eolMediaUrl
                rightsHolder: author,
                license: license,
                dataType: [ 'foo', targetDataType ]
              },
              { // Missing license
                eolMediaURL: url,
                rightsHolder: author,
                dataType: [ 'foo', targetDataType ]
              },
              { // Should be parsed
                eolMediaURL: url,
                agents: [
                  {
                    full_name: author
                  },
                ],
                license: license,
                dataType: [ targetDataType ]
              },
              { // Garbage
                dataType: [ 'foo', 'bar' ]
              },
              { // Should be parsed
                eolMediaURL: url,
                license: 'notalicense',
                dataType: [ targetDataType ]
              },
              {
                foo: 'bar' // Missing dataType array
              }
            ]
          }
        }
      ;

      beforeEach(() => {
        speciesImagesSupplier.supply({}, apiResults, cb);
      });

      it('produces the correct result', () => {
        var expectedCredit = 'John Smith CC-BY'
          , expectedResult = {
              url: fullSzUrl,
              thumbUrl: thumbUrl,
              credit: {
                text: expectedCredit
              }
            }
          ;

        expect(cb).to.have.been.calledWith(null, [
          expectedResult,
          expectedResult,
          { url: fullSzUrl, thumbUrl: thumbUrl, credit: { text: 'Unknown' } }
        ]);
      });
    });

    context('when pages result missing from api results', () => {
      var apiResults = {
        foo: 'bar'
      };

      it('throws a TypeError', () => {
        expect(() => { speciesImagesSupplier.supply({}, apiResults, cb); })
          .to.throw(TypeError);
      });
    });

    context('when dataObjects missing from apiResults.pages', () => {
      var apiResults = {
        pages: {
          foo: 'bar'
        }
      };

      beforeEach(() => {
        speciesImagesSupplier.supply({}, apiResults, cb);
      });

      it('returns an empty result', () => {
        expect(cb).to.have.been.calledWith(null, []);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
