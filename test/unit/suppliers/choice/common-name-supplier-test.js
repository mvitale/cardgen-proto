var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , dataUtils = require('_/data-utils/data-utils')
  ;

var commonNameSupplier =
  require('_/suppliers/choice/common-name-supplier');

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
    var commonName = 'common name'
      , pages = { pages: 'pages' }
      , apiResults = {
          pages: pages
        }
      , parseCommonName
      ;

    beforeEach(() => {
      parseCommonName = sandbox.stub(dataUtils, 'parseCommonName');
    });

    context('when dataUtils.parseCommonName returns a result', () => {
      beforeEach(() => {
        parseCommonName.returns(commonName);
        commonNameSupplier.supply({}, apiResults, cb);
      });

      it('yields that result', () => {
        expect(parseCommonName).to.have.been.calledOnce.calledWith(pages);
        expect(cb).to.have.been.calledWith(null, [
          { text: commonName, choiceKey: commonName }
        ]);
      });
    });

    context('when dataUtils.parseCommonName returns null', () => {
      beforeEach(() => {
        parseCommonName.returns(null);
        commonNameSupplier.supply({}, apiResults, cb);
      });

      it('yields an empty array', () => {
        expect(parseCommonName).to.have.been.calledOnce.calledWith(pages);
        expect(cb).to.have.been.calledWith(null, []);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
