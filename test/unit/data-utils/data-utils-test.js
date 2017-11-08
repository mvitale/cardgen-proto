var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;

var dataUtils = require('_/data-utils/data-utils');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('data-utils', () => {
  describe('#parseImages', () => {
    context('when pagesResult.dataObjects is present', () => {
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
        , pagesResult = {
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
        ;

      it('returns the correct result', () => {
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

        it('returns the expected result', () => {
          expect(dataUtils.parseImages(pagesResult)).to.eql([
            expectedResult1,
            expectedResult2,
            expectedResult3
          ]);
        });
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
