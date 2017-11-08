var reqlib = require('app-root-path').require;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;

var Card = reqlib('lib/models/card')
  , templateManager = reqlib('lib/template-manager')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('Card', () => {
  var validData = {
        templateName: 'foo',
        templateVersion: '1.4',
        userId: 1,
        locale: 'en',
        appId: 'app'
      }
    , doc
    ;

  function shouldBehaveLikeFieldMissing(missingField) {
    it('should be invalid', (next) => {
      var data = Object.assign({}, validData)
        ;

      delete data[missingField];
      doc = new Card(data);

      doc.validate((err) => {
        expect(err).not.to.be.null;
        next();
      });
    });
  }

  describe('validations and defaults', () => {
    describe('valid document', () => {
      beforeEach(() => {
        doc = new Card(validData);
      });

      it('should be valid', (next) => {
        doc.validate((err) => {
          expect(err).to.be.null;
          next();
        });
      });

      it('should default templateParams', () => {
        expect(doc.templateParams).to.eql({});
      });

      it('should default choices', () => {
        expect(doc.choices).to.eql({});
      });

      it('should default data', () => {
        expect(doc.data).to.eql({});
      });

      it('should default version', () => {
        expect(doc.version).to.eql(0);
      });
    });

    context('when document is missing userId', () => {
      shouldBehaveLikeFieldMissing('userId');
    });

    context('when document is missing locale', () => {
      shouldBehaveLikeFieldMissing('locale');
    });

    context('when document is missing appId', () => {
      shouldBehaveLikeFieldMissing('appId');
    });

    context('when document is missing templateName', () => {
      shouldBehaveLikeFieldMissing('templateName');
    });

    context('when document is missing templateVersion', () => {
      shouldBehaveLikeFieldMissing('templateVersion');
    });
  });

  describe('#populateDefaultsAndChoices', () => {
    var getDefaultAndChoiceData
      , choices = { foo: 'bar' }
      , defaultData = { baz: 'bop' }
      ;

    beforeEach(() => {
      doc = new Card(validData);
      getDefaultAndChoiceData = sandbox.stub(templateManager, 'getDefaultAndChoiceData');
    });

    context('when getDefaultAndChoiceData yields a result', () => {
      beforeEach(() => {
        getDefaultAndChoiceData.yields(null, {
          defaultData: defaultData,
          choices: choices
        });
      });

      it('correctly sets its data and choices fields', () => {
        doc.populateDefaultsAndChoices((err) => {
          expect(getDefaultAndChoiceData).to.have.been.calledOnce.calledWith(
            doc.templateName, doc.templateVersion, doc.locale, doc.templateParams
          );

          expect(err).not.to.exist;
          expect(doc.data).to.equal(defaultData);
          expect(doc.choices).to.equal(choices);
        });
      });
    });

    context('when getDefaultAndChoiceData yields an error', () => {
      var error = new Error('error in getDefaultAndChoiceData');

      beforeEach(() => {
        getDefaultAndChoiceData.yields(error);
      });

      it('calls cb with the error', () => {
        doc.populateDefaultsAndChoices((err) => {
          expect(err).to.equal(error);
        });
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
