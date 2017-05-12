var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var templates = require('_/routes/templates')
  , templateManager = require('_/template-manager')
  , resUtils = require('_/routes/util/res-utils')
  , TemplateWrapper = require('_/api-wrappers/template-wrapper')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('templates', () => {
  describe('#getTemplate', () => {
    var template = {
        name: 'valid_template_name'
      }
    , req
    , res
    , jsonRes
    , getTemplate
    ;

    beforeEach(() => {
      jsonRes = sandbox.stub(resUtils, 'jsonRes');
      res = {};
      getTemplate = sandbox.stub(templateManager, 'getTemplate');

      getTemplate.returns(null);
      getTemplate.withArgs('valid_template_name').returns(template);
    });

    context('when a valid template name is requested', () => {
      beforeEach(() => {
        req = {
          params: {
            templateName: 'valid_template_name'
          }
        };

        templates.getTemplate(req, res);
      });

      it('sets up the correct response', () => {
        var args;

        expect(jsonRes).to.have.been.calledOnce;

        args = jsonRes.getCall(0).args;

        expect(args[0]).to.equal(res);
        expect(args[1]).to.equal(resUtils.httpStatus.ok);
        expect(args[2].delegate).to.equal(template);
      });
    });

    context('when an invalid template name is requested', () => {
      beforeEach(() => {
        req = {
          params: {
            templateName: 'invalid_template_name'
          }
        }

        templates.getTemplate(req, res);
      });

      it('sets up the correct response', () => {
        expect(jsonRes).to.have.been.calledOnce;
        expect(jsonRes).to.have.been.calledWith(res, resUtils.httpStatus.notFound,
          { msg: 'template invalid_template_name not found'});
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
