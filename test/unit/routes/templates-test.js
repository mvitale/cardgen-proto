var reqlib = require('app-root-path').require;
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
    var templateName = 'valid_template_name'
      , templateVersion = '1.3'
      , locale = 'en'
      , template = {
          name: templateName,
          version: templateVersion
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
      getTemplate.withArgs(templateName, templateVersion, locale).returns(template);
    });

    context('when a valid template name is requested', () => {
      beforeEach(() => {
        req = {
          params: {
            templateName: templateName,
            templateVersion: templateVersion
          },
          locale: locale
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

    function behavesLikeInvalidTemplateParam(templateName, templateVersion) {
      expect(jsonRes).to.have.been.calledOnce;
      expect(jsonRes).to.have.been.calledWith(res, resUtils.httpStatus.notFound,
        { msg: 'template ' + templateName + ' at version ' + templateVersion + ' not found'});
    }

    context('when an invalid template name is requested', () => {
      var invalidTemplateName = 'invalid_template_name';

      beforeEach(() => {
        req = {
          params: {
            templateName: invalidTemplateName,
            templateVersion: templateVersion
          },
          locale: locale
        }

        templates.getTemplate(req, res);
      });

      it('', () => {
        behavesLikeInvalidTemplateParam(invalidTemplateName, templateVersion);
      })
    });

    context('when an invalid template version is requested', () => {
      var invalidVersion = '10000.1';

      beforeEach(() => {
        req = {
          params: {
            templateName: templateName,
            templateVersion: invalidVersion
          }, 
          locale: locale
        }

        templates.getTemplate(req, res);
      });

      it('', () => {
        behavesLikeInvalidTemplateParam(templateName, invalidVersion);
      })
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
