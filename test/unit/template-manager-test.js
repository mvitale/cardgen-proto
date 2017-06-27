var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var fs = require('fs');

var expect = chai.expect;
chai.use(sinonChai)

var sandbox = sinon.sandbox.create();

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

describe('template-manager', () => {
  var templateManager;

  beforeEach(() => {
    templateManager = require('_/template-manager');
  });

  describe('#load', () => {

    context('when the templateLoader returns a valid result', () => {
      beforeEach(() => {
        templateManager.setTemplateLoader({
          templates: function() {
            return [ template1, template2 ];
          }
        });

        templateManager.load();
      });

      it('loads the templates', () => {
        expect(templateManager.getTemplate('template1')).to.equal(template1);
        expect(templateManager.getTemplate('template2')).to.equal(template2);
      });

      afterEach(() => {
        templateManager.setTemplateLoader();
      });
    });
  });

  describe('#getDefaultAndChoiceData', () => {
    var callback;

    beforeEach(() => {
      callback = sinon.spy();
      templateManager.setTemplateLoader({
        templates: function() {
          return [ template1 ];
        }
      });
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

    context('when no dependencies return errors', () => {
      beforeEach(() => {
        templateManager.setSupplierLoader({
          load: function(name, type) {
            if (name === 'species-data-supplier' && type === 'api') {
              return okApiSupplier;
            } else if (name === 'species-images-supplier' && type === 'choice') {
              return okChoiceSupplier;
            } else if (name === 'common-name-supplier' && type === 'default') {
              return okDefaultSupplier;
            }
          }
        });
      });

      context('when called with a valid template name', () => {
        it('yields the correct result', () => {
          templateManager.getDefaultAndChoiceData(
            'template1',
            { speciesId: 1234 },
            callback
          );

          expect(callback.called).to.be.true;

          expect(callback).to.have.been.calledWith(null, {
            "choiceTips": {},
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
        templateManager.setSupplierLoader({
          load: function(name, type) {
            if (name === 'species-data-supplier' && type === 'api') {
              return {
                supply: function(templateParams, cb) {
                  return cb(apiError);
                }
              };
            } else if (name === 'species-images-supplier' && type === 'choice') {
              return okChoiceSupplier;
            } else if (name === 'common-name-supplier' && type === 'default') {
              return okDefaultSupplier;
            }
          }
        });
      });

      it('yields an error', () => {
        templateManager.getDefaultAndChoiceData(
          'template1',
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
        templateManager.setSupplierLoader({
          load: function(name, type) {
            if (name === 'species-data-supplier' && type === 'api') {
              return okApiSupplier;
            } else if (name === 'species-images-supplier' && type === 'choice') {
              return {
                supply: function(params, apiResults, cb) {
                  return cb(choiceSupplierError);
                }
              };
            } else if (name === 'common-name-supplier' && type === 'default') {
              return okDefaultSupplier;
            }
          }
        });
      });

      it('yields an error', () => {
        templateManager.getDefaultAndChoiceData(
          'template1',
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
        templateManager.setSupplierLoader({
          load: function(name, type) {
            if (name === 'species-data-supplier' && type === 'api') {
              return okApiSupplier;
            } else if (name === 'species-images-supplier' && type === 'choice') {
              return okChoiceSupplier;
            } else if (name === 'common-name-supplier' && type === 'default') {
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
          'template1',
          { speciesId: 1234 },
          callback
        );

        expect(callback.called).to.be.true;
        expect(callback).to.have.been.calledWith(defaultSupplierError);
      });
    });

    afterEach(() => {
      templateManager.setSupplierLoader();
      templateManager.setTemplateLoader();
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
})
