var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;

var templateSupplier = require('_/card-wrapper-template-supplier')
  , templateManager = require('_/template-manager')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('cardWrapperTemplateSupplier', () => {
  describe('#supply', () => {
    var cb
      , getTemplate
      , templateName = 'myTemplate'
      , templateVersion = '2.3'
      , locale = 'zh'
      , template = {
          name: templateName
        }
      ;


    beforeEach(() => {
      getTemplate = sandbox.stub(templateManager, 'getTemplate');
      cb = sinon.spy();
    });

    context('when getTemplate returns a result', () => {


      beforeEach(() => {
        getTemplate.returns(template)
      });

      it('yields it', () => {
        templateSupplier.supply(templateName, templateVersion, locale, cb);
        expect(cb).to.have.been.calledOnce.calledWith(null, template);
        expect(getTemplate).to.have.been.calledOnce.calledWith(templateName,
          templateVersion, locale);
      });
    });

    context('when getTemplate returns null', () => {
      beforeEach(() => {
        getTemplate.returns(null);
      });

      it('yields an error', () => {
        templateSupplier.supply(templateName, templateVersion, locale, cb);
        expect(cb).to.have.been.calledOnce.calledWith(sinon.match.instanceOf(Error));
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
