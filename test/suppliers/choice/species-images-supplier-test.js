var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var verrorChai = require('../../helpers/verror-chai');

var expect = chai.expect;
chai.use(sinonChai);
chai.use(verrorChai);

var speciesImagesSupplier =
  require('../../../suppliers/choice/species-images-supplier');


var sandbox = sinon.sandbox.create();

describe('species-images-supplier', () => {
  describe('#supply', () => {
    var cb;

    beforeEach(() => {
      cb = sinon.spy();
    });

    context('when apiResults.pages.dataObjects is present', () => {
      var url = 'http://www.foo.com/image.png'
      , author = 'John Smith'
      , license = 'http://creativecommons.org/licenses/by/'
      , targetDataType = 'http://purl.org/dc/dcmitype/StillImage'
      , apiResults = {
          pages:  {
            dataObjects: [
              {
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
              {
                eolMediaURL: url,
                agents: [
                  {
                    full_name: author
                  },
                ],
                license: license,
                dataType: [ targetDataType ]
              },
              {
                dataType: [ 'foo', 'bar' ]
              },
              {
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
              url: url,
              credit: {
                text: expectedCredit
              }
            }
          ;

        expect(cb).to.have.been.calledWith(null, [
          expectedResult,
          expectedResult,
          { url: url, credit: { text: 'Unknown' } }
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
