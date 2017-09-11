/*
 * TODO: rewrite for appropriate module
var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var util = require('_/suppliers/default/util/util');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('util', () => {
  describe('#extractClassName', () => {
    var apiResults;

    context('when hierarchy_entries missing from apiResults', () => {
      beforeEach(() => {
        apiResults = {
          foo: 'bar'
        }
      });

      it('throws TypeError', () => {
        expect(util.extractClassName.bind(apiResults)).to.throw(TypeError);
      });
    });

    context('when ancestors is missing', () => {
      beforeEach(() => {
        apiResults = {
          hierarchy_entries: {
            foo: 'bar'
          }
        };
      });

      it("returns ''", () => {
        expect(util.extractClassName(apiResults)).to.equal('');
      });
    });

    context('when ancestors contains class element with scientificName', () => {
      beforeEach(() => {
        apiResults = {
          hierarchy_entries: {
            ancestors: [
              {
                taxonRank: 'foo'
              },
              {
                taxonRank: 'class',
                scientificName: 'classname'
              },
              {
                taxonRank: 'bar'
              }
            ]
          }
        };
      });

      it('returns the scientificName', () => {
        expect(util.extractClassName(apiResults)).to.equal('classname');
      });
    });

    context("when ancestors doesn't contain a class element", () => {
      beforeEach(() => {
        apiResults = {
          hierarchy_entries: {
            ancestors: [
              {
                taxonRank: 'foo'
              },
              {
                taxonRank: 'bar'
              }
            ]
          }
        };
      });

      it("returns ''", () => {
        expect(util.extractClassName(apiResults)).to.equal('');
      });
    });

    context(
      "when ancestors contains a class element that doesn't have a " +
        "scientificName",
      () => {
        beforeEach(() => {
          apiResults = {
            hierarchy_entries: {
              ancestors: [
                {
                  taxonRank: 'class'
                }
              ]
            }
          }
        });

        it("returns ''", () => {
          expect(util.extractClassName(apiResults)).to.equal('');
        });
      }
    );

    // TODO: Should ensure capitalization of class name
  });

  afterEach(() => {
    sandbox.restore();
  });
});
*/
