var reqlib = require('app-root-path').require;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , dataUtils = reqlib('lib/data-utils/data-utils')
  ;

var commonNameSupplier =
  reqlib('lib/suppliers/choice/common-name-supplier');

chai.use(sinonChai);

var expect = chai.expect;
var sandbox = sinon.sandbox.create();

describe('common-name-supplier', () => {
  var cb
    ;

  beforeEach(() => {
    cb = sinon.spy();
  });

  describe('#supply', () => {
    var data
      , locale = 'es'
      ;

    beforeEach(() => {
      data = {
        taxon: {}
      };
    });

    context('when there is commonName in data.taxon', () => {
      var commonName = 'Red Junglefowl';

      beforeEach(() => {
        data.taxon.commonName = commonName;
        commonNameSupplier.supply({}, data, locale, cb);
      });

      it('yields that result', () => {
        expect(cb).to.have.been.calledWith(null, [
          { text: commonName, choiceKey: commonName }
        ]);
      });
    });

    context("when there isn't a commonName in data.taxon", () => {
      beforeEach(() => {
        commonNameSupplier.supply({}, data, locale, cb);
      });

      it('yields an empty array', () => {
        expect(cb).to.have.been.calledWith(null, []);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
