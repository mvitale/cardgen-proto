var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;

var card = require('_/models/card')
  , templateManager = require('_/template-manager')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  , Card = card.Card
  ;

chai.use(sinonChai);

describe('Card', () => {
  var validData = {
      templateName: 'foo',
      userId: 1
    }
    , doc
    ;

  describe('validations and defaults', () => {
    describe('valid document', () => {
      beforeEach(() => {
        doc = new Card(validData);
      });

      it('should be valid', () => {
        doc.validate((err) => {
          expect(err).to.be.null;
        });
      });

      it('should default templateParams', () => {
        expect(doc.templateParams).to.eql({});
      });

      it('should default defaultData', () => {
        expect(doc.defaultData).to.eql({});
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

    context('when document is missing templateName', () => {
      beforeEach(() => {
        var badData = Object.assign({}, validData);

        badData.templateName = null;
        doc = new Card(badData);
      });

      it('should be invalid', (next) => {
        doc.validate((err) => {
          expect(err).not.to.be.null;
          next();
        });
      });
    });

    context('when document is missing userId', () => {
      beforeEach(() => {
        var badData = Object.assign({}, validData);

        badData.userId = null;
        doc = new Card(badData);
      });

      it('should be invalid', (next) => {
        doc.validate((err) => {
          expect(err).not.to.be.null;
          next();
        });
      });
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
    })

    context('when getDefaultAndChoiceData yields a result', () => {
      beforeEach(() => {
        getDefaultAndChoiceData.yields(null, {
          defaultData: defaultData,
          choices: choices
        });
      });

      it('correctly sets its defaultData and choices fields', () => {
        doc.populateDefaultsAndChoices((err) => {
          expect(getDefaultAndChoiceData).to.have.been.calledOnce.calledWith(
            doc.templateName, doc.templateParams
          );

          expect(err).not.to.exist;
          expect(doc.defaultData).to.equal(defaultData);
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
