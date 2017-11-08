var reqlib = require('app-root-path').require;
var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var fs = require('fs');
var path = require('path');

var templateLoader = reqlib('lib/template-loader');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

var template1 = {
  type: 'trait',
  name: 'template1',
  params: [
    {
      name: 'speciesId',
      type: 'eol-taxon-id'
    }
  ],
  apiSupplier: 'species-data-supplier',
  choiceSuppliers: {
    mainPhoto: 'species-images-supplier'
  },
  defaultSuppliers: {
    commonName: 'common-name-supplier'
  }
};

var template2 = {
  type: 'title',
  name: 'template2',
  fields: []
};

var invalidTemplateStr = "{ \"type\": 'invalid JSON' }";

describe('template-loader', () => {
  describe('#templates', () => {
    var templatesPath = path.join(__dirname, '../../', 'lib', 'templates');

    context('when all templates in the directory are valid JSON', () => {
      beforeEach(() => {
        var readFileSync = sandbox.stub(fs, 'readFileSync');;

        readFileSync
          .withArgs(path.join(templatesPath, 'template1.json'))
          .returns(JSON.stringify(template1));

        readFileSync
          .withArgs(path.join(templatesPath, 'template2.json'))
          .returns(JSON.stringify(template2));

        sandbox.stub(fs, 'readdirSync').callsFake((path) => {
          return [ 'template1.json', 'template2.json' ];
        });
      });

      it('should successfully load and return the templates', () => {
        var templates = templateLoader.templates();
        expect(templates).to.deep.equal([template1, template2]);
      });
    });

    context('when there is a file in the directory that is invalid JSON', () => {
      beforeEach(() => {
        var readFileSync;

        sandbox.stub(fs, 'readdirSync').callsFake((path) => {
          return [ 'template1.json', 'invalid.json' ];
        });

        readFileSync = sandbox.stub(fs, 'readFileSync');

        readFileSync
          .withArgs(path.join(templatesPath, 'template1.json'))
          .returns(JSON.stringify(template1));

        readFileSync
          .withArgs(path.join(templatesPath, 'invalid.json'))
          .returns(invalidTemplateStr);
      });

      it('should throw an Error', () => {
        expect(templateLoader.templates).to.throw(Error);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
