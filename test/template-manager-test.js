var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var fs = require('fs');

var expect = chai.expect;
chai.use(sinonChai)

var sandbox = sinon.sandbox.create();

var template1 = {
  type: 'trait',
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
  fields: []
};

var invalidTemplateStr = "{ \"type\": 'invalid JSON' }";

describe('template-manager', () => {
  var templateManager;

  beforeEach(() => {
    templateManager = require('../template-manager');
  });

  describe('#load', () => {
    context('when all templates in the directory are valid JSON', () => {
      beforeEach(() => {
        var readFileSync;

        sandbox.stub(fs, 'readdirSync').callsFake((path) => {
          return [ 'template1.json', 'template2.json' ];
        });

        readFileSync = sandbox.stub(fs, 'readFileSync');

        readFileSync
          .withArgs('./templates/template1.json')
          .returns(JSON.stringify(template1));

        readFileSync
          .withArgs('./templates/template2.json')
          .returns(JSON.stringify(template2));
      });

      it('should successfully load the templates', () => {
        templateManager.load();

        expect(templateManager.getTemplate('template1')).to.eql(template1);
        expect(templateManager.getTemplate('template2')).to.eql(template2);
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
          .withArgs('./templates/template1.json')
          .returns(JSON.stringify(template1));

        readFileSync
          .withArgs('./templates/invalid.json')
          .returns(invalidTemplateStr);
      });

      it('should throw an Error', () => {
        expect(templateManager.load).to.throw(Error);
      });
    });
  });

  describe('#getDefaultAndChoiceData', () => {
    var callback;

    beforeEach(() => {
      var readFileSync;

      callback = sinon.spy();

      sandbox.stub(fs, 'readdirSync').callsFake((path) => {
        return [ 'template.json' ];
      });

      readFileSync = sandbox.stub(fs, 'readFileSync');

      readFileSync
        .withArgs('./templates/template.json')
        .returns(JSON.stringify(template1));
    });

    var okApiSupplier = {
      supply: function(templateParams, cb) {
        cb(null, { apiresults: true });
      }
    };

    var okChoiceSupplier = {
      supply: function(params, apiResults, cb) {
        cb(null, [
          { url: 'www.url1.com' },
          { url: 'www.url2.com' }
        ]);
      }
    };

    var okDefaultSupplier = {
      supply: function(params, apiResults, choices, cb) {
        cb(null, 'Red panda');
      }
    };

    describe('when no dependencies return errors', () => {

      beforeEach(() => {
        templateManager.load({
          load: function(path) {
            switch (path) {
              case './suppliers/api/species-data-supplier':
                return okApiSupplier;
              case './suppliers/choice/species-images-supplier':
                return okChoiceSupplier;
              case './suppliers/default/common-name-supplier':
                return okDefaultSupplier;
            }
          }
        });
      });

      context('when called with a valid template name', () => {
        it('yields the correct result', () => {
          templateManager.getDefaultAndChoiceData(
            'template',
            { speciesId: 1234 },
            callback
          );

          expect(callback.called).to.be.true;

          expect(callback).to.have.been.calledWith(null, {
            "defaultData": {
              "commonName": {
                "value": "Red panda"
              }
            },
            "choices": {
              "mainPhoto": [
                {"url":"www.url1.com"},
                {"url":"www.url2.com"}
              ]
            }
          });
        });
      });

      context('when called with an invalid template name', () => {
        it('yields an error', () => {
          templateManager.getDefaultAndChoiceData(
            'invalidtemplate',
            {},
            callback
          );

          expect(callback.called).to.be.true;
          expect(callback.args[0][0] instanceof Error).to.be.true;
          expect(callback.args[0][0].message).to.equal('Template invalidtemplate not found');
        });
      });
    });

    context('when the API supplier returns an error', () => {
      var apiError = new Error('Failed to connect to EOL');
      beforeEach(() => {
        templateManager.load({
          load: function(path) {
            switch (path) {
              case './suppliers/api/species-data-supplier':
                return {
                  supply: function(templateParams, cb) {
                    return cb(apiError);
                  }
                }
              case './suppliers/choice/species-images-supplier':
                return okChoiceSupplier;
              case './suppliers/default/common-name-supplier':
                return okDefaultSupplier;
            }
          }
        });
      });

      it('yields an error', () => {
        templateManager.getDefaultAndChoiceData(
          'template',
          { speciesId: 1234 },
          callback
        );

        expect(callback.called).to.be.true;
        expect(callback).to.have.been.calledWith(apiError);
      });
    });

    context('when the choice supplier returns an error', () => {
      var choiceSupplierError = new Error('Failed to build choices');
      beforeEach(() => {
        templateManager.load({
          load: function(path) {
            switch (path) {
              case './suppliers/api/species-data-supplier':
                return okApiSupplier;
              case './suppliers/choice/species-images-supplier':
                return {
                  supply: function(params, apiResults, cb) {
                    return cb(choiceSupplierError);
                  }
                };
              case './suppliers/default/common-name-supplier':
                return okDefaultSupplier;
            }
          }
        });
      });

      it('yields an error', () => {
        templateManager.getDefaultAndChoiceData(
          'template',
          { speciesId: 1234 },
          callback
        );

        expect(callback.called).to.be.true;
        expect(callback).to.have.been.calledWith(choiceSupplierError);
      });
    });

    context('when the default supplier returns an error', () => {
      var defaultSupplierError = new Error('Failed to get defaults');

      beforeEach(() => {
        templateManager.load({
          load: function(path) {
            switch (path) {
              case './suppliers/api/species-data-supplier':
                return okApiSupplier;
              case './suppliers/choice/species-images-supplier':
                return okChoiceSupplier
              case './suppliers/default/common-name-supplier':
                return {
                  supply: function(params, apiResults, choices, cb) {
                    return cb(defaultSupplierError);
                  }
                };
            }
          }
        });
      });

      it('yields an error', () => {
        templateManager.getDefaultAndChoiceData(
          'template',
          { speciesId: 1234 },
          callback
        );

        expect(callback.called).to.be.true;
        expect(callback).to.have.been.calledWith(defaultSupplierError);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
})
