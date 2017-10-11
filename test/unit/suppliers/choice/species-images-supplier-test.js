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
    var cb
      , locale = 'es'
      ;

    beforeEach(() => {
      cb = sinon.spy();
    });

    context('when apiResults.pages.dataObjects is present', () => {
      var url1 = 'https://www.eol.org/12345_orig.jpg'
        , url2 = 'https://www.eol.org/54321_orig.jpg'
        , url3 = 'https://www.eol.org/11111_orig.jpg'
        , fullSzUrl1 = 'https://www.eol.org/12345_580_360.jpg'
        , thumbUrl1 = 'https://www.eol.org/12345_130_130.jpg'
        , author1 = 'John Smith'
        , fullSzUrl2 = 'https://www.eol.org/54321_580_360.jpg'
        , thumbUrl2 = 'https://www.eol.org/54321_130_130.jpg'
        , author2 = 'Smith John'
        , fullSzUrl3 = 'https://www.eol.org/11111_580_360.jpg'
        , thumbUrl3 = 'https://www.eol.org/11111_130_130.jpg'
        , license = 'http://creativecommons.org/licenses/by/'
        , targetDataType = 'http://purl.org/dc/dcmitype/StillImage'
        , apiResults = {
          pages:  {
            dataObjects: [
              { // Should be parsed
                eolMediaURL: url1,
                rightsHolder: author1,
                license: license,
                dataType: [ 'foo', targetDataType ]
              },
              { // Missing eolMediaUrl
                rightsHolder: author1,
                license: license,
                dataType: [ 'foo', targetDataType ]
              },
              { // Missing license
                eolMediaURL: url1,
                rightsHolder: author1,
                dataType: [ 'foo', targetDataType ]
              },
              { // Should be parsed
                eolMediaURL: url2,
                agents: [
                  {
                    full_name: author2
                  },
                ],
                license: license,
                dataType: [ targetDataType ]
              },
              { // Duplicate
                eolMediaURL: url2,
                agents: [
                  {
                    full_name: author2
                  },
                ],
                license: license,
                dataType: [ targetDataType ]
              },
              { // Garbage
                dataType: [ 'foo', 'bar' ]
              },
              { // Should be parsed
                eolMediaURL: url3,
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
        speciesImagesSupplier.supply({}, apiResults, locale, cb);
      });

      it('produces the correct result', () => {
        var expectedCredit1 = 'John Smith CC-BY'
          , expectedCredit2 = 'Smith John CC-BY'
          , expectedResult1 = {
              url: fullSzUrl1,
              thumbUrl: thumbUrl1,
              credit: {
                text: expectedCredit1
              },
              choiceKey: fullSzUrl1
            }
          , expectedResult2 = {
              url: fullSzUrl2,
              thumbUrl: thumbUrl2,
              credit: {
                text: expectedCredit2
              },
              choiceKey: fullSzUrl2
            }
          , expectedResult3 = {
              url: fullSzUrl3,
              thumbUrl: thumbUrl3,
              credit: {
                text: 'Unknown'
              },
              choiceKey: fullSzUrl3
            }
          ;

        expect(cb).to.have.been.calledWith(null, [
          expectedResult1,
          expectedResult2,
          expectedResult3
        ]);
      });
    });

    context('when pages result missing from api results', () => {
      var apiResults = {
        foo: 'bar'
      };

      it('throws a TypeError', () => {
        expect(() => { speciesImagesSupplier.supply({}, apiResults, locale, cb); })
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
        speciesImagesSupplier.supply({}, apiResults, locale, cb);
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
