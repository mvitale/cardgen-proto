var chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , fs = require('fs')
  , i18n = require('_/i18n')
  , config = require('_/config/config')
  ;

var expect = chai.expect;
chai.use(sinonChai)

var sandbox = sinon.sandbox.create();

var labelKeyPrefix = 'template.fieldLabels.';

var template1 = {
  name: 'template1',
  version: '1.0',
  params: [
    {
      name: 'speciesId',
      type: 'eol-taxon-id'
    }
  ],
  spec: {
    fields: {
      someText: {
        labelKey: 'someText'
      }
    },
  },
  dataSupplier: 'species-data-supplier',
  choiceSuppliers: {
    mainPhoto: 'species-images-supplier'
  },
  defaultSuppliers: {
    commonName: 'common-name-supplier'
  }
};

var template1Resolved = {
  name: 'template1',
  version: '1.0',
  params: [
    {
      name: 'speciesId',
      type: 'eol-taxon-id'
    }
  ],
  spec: {
    fields: {
      someText: {
        label: 'Some text'
      }
    },
  },
  dataSupplier: 'species-data-supplier',
  choiceSuppliers: {
    mainPhoto: 'species-images-supplier'
  },
  defaultSuppliers: {
    commonName: 'common-name-supplier'
  }
};

var template2 = {
  name: 'template2',
  version: '2.3',
  spec: {
    fields: {
      otherText: {
        labelKey: 'otherText'
      }
    }
  }
};

var template2Resolved = {
  name: 'template2',
  version: '2.3',
  spec: {
    fields: {
      otherText: {
        label: 'Other text'
      }
    }
  }
}

var v1 = '1.5'
  , v2 = '2.1'
  , v3 = '2.2'
  , t1v1 = JSON.parse(JSON.stringify(template1))
  , t1v2 = JSON.parse(JSON.stringify(template1))
  , t1v3 = JSON.parse(JSON.stringify(template1))
  , t1v1res = JSON.parse(JSON.stringify(template1Resolved))
  , t1v2res = JSON.parse(JSON.stringify(template1Resolved))
  , t1v3res = JSON.parse(JSON.stringify(template1Resolved))
  ;
  
t1v1.version = t1v1res.version = v1;
t1v2.version = t1v2res.version = v2;
t1v3.version = t1v3res.version = v3;

describe('template-manager', () => {
  var templateManager
    , tStub
    , configGetStub
    ;

  beforeEach(() => {
    templateManager = require('_/template-manager');

    tStub = sandbox.stub(i18n, 't');
    tStub.withArgs('en', labelKeyPrefix + 'someText').returns('Some text');
    tStub.withArgs('en', labelKeyPrefix + 'otherText').returns('Other text');

    configGetStub = sandbox.stub(config, 'get');
    configGetStub.withArgs('i18n.availableLocales').returns(['en']);
    configGetStub.withArgs('i18n.defaultLocale').returns('en');
  });

  describe('#getTemplate', () => {
      
    beforeEach(() => {

      templateManager.setTemplateLoader({
        templates: function() {
          return [ t1v1, t1v2, t1v3, template2 ];
        }
      });

      templateManager.load();
    });

    context('when template name and version are valid', () => {
      context('when locale is loaded', () => {
        it('returns the translated template for that locale', () => {
          expect(templateManager.getTemplate('template1', v2, 'en')).to.eql(t1v2res);
          expect(templateManager.getTemplate('template2', '2.3', 'en')).to.eql(template2Resolved);
        });
      });

      context('when locale isn\'t loaded', () => {
        it('returns the template for the default locale', () => {
          expect(templateManager.getTemplate('template1', v2, 'es')).to.eql(t1v2res);
          expect(templateManager.getTemplate('template2', '2.3', 'zh')).to.eql(template2Resolved);
        });
      });
    });

    context('when version is null specified', () => {
      it('throws a TypeError', () => {
        expect(() => { templateManager.getTemplate('template1', null, 'es') }).to.throw(TypeError);
      });
    });

    context('when the template name is invalid', () => {
      it ('returns null', () => {
        expect(templateManager.getTemplate('bogus', v1, 'en')).to.be.null;
      });
    });

    context('when the locale is null', () => {
      it ('throws an error', () => {
        expect(() => { templateManager.getTemplate('template1', v1, null)}).to.throw(TypeError);
      });
    });

    afterEach(() => {
      templateManager.setTemplateLoader();
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
      templateManager.load();
    });

    var okDataSupplier = {
      supply: function(templateParams, cb) {
        cb(null, { data: true });
      }
    };

    var okChoiceSupplier = {
      supply: function(params, data, locale, cb) {
        cb(null, [
          { url: 'www.url1.com' },
          { url: 'www.url2.com' }
        ]);
      }
    };

    var okDefaultSupplier = {
      supply: function(params, data, choices, tips, cb) {
        cb(null, 'Red panda');
      }
    };

    context('when no dependencies return errors', () => {
      beforeEach(() => {
        templateManager.setSupplierLoader({
          load: function(name, type) {
            if (name === 'species-data-supplier' && type === 'data') {
              return okDataSupplier;
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
            v1,
            'en',
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
            v1,
            'en',
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
            if (name === 'species-data-supplier' && type === 'data') {
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
          v1,
          'en',
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
            if (name === 'species-data-supplier' && type === 'data') {
              return okDataSupplier;
            } else if (name === 'species-images-supplier' && type === 'choice') {
              return {
                supply: function(params, data, locale, cb) {
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
          v1,
          'en',
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
            if (name === 'species-data-supplier' && type === 'data') {
              return okDataSupplier;
            } else if (name === 'species-images-supplier' && type === 'choice') {
              return okChoiceSupplier;
            } else if (name === 'common-name-supplier' && type === 'default') {
              return {
                supply: function(params, data, choices, tips, cb) {
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
          v1,
          'en',
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
