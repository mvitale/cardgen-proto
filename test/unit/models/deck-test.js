var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , sinonMongoose = require('sinon-mongoose')
  ;

var deck = require('_/models/deck')
  , card = require('_/models/card')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  , Deck = deck.Deck
  , Card = card.Card
  ;

chai.use(sinonChai);

describe('Deck', () => {
  var doc
    , minValidData = {
        name: 'Pandas',
        userId: 4
      }
    ;

  function minValidDoc() {
    return new Deck(minValidData);
  }

  describe('validations', () => {
    describe('valid instance', () => {
      beforeEach(() => {
        doc = minValidDoc();
      });

      it('is valid', (done) => {
        doc.validate((err) => {
          expect(err).not.to.exist;
          done();
        });
      });
    });

    context("when name isn't present", (done) => {
      beforeEach(() => {
        var data = Object.assign({}, minValidData);
        data.name = null;
        doc = new Deck(data);
      });

      it('is invalid', (done) => {
        doc.validate((err) => {
          expect(err).to.exist;
          done();
        });
      });
    });

    context("when userId isn't present", () => {
      beforeEach(() => {
        var data = Object.assign({}, minValidData);
        data.userId = null;
        doc = new Deck(data);
      });

      it('is invalid', (done) => {
        doc.validate((err) => {
          expect(err).to.exist;
          done();
        });
      });
    });

    describe('#cards', () => {
      var findChainMock;

      beforeEach(() => {
        doc = new Deck(minValidData);

        findChainMock = sandbox.mock(Card)
          .expects('find').withArgs({ _deck: doc })
          .chain('sort').withArgs('-_id')
          .chain('populate').withArgs('_deck')
          .chain('exec');
      });

      context('when it contains Cards', () => {
        var cards = [
          { fee: 'fi' },
          { fo: 'fum'}
        ];

        beforeEach(() => {
          findChainMock.yields(null, cards);
        });

        it('yields its cards', (done) => {
          doc.cards((err, result) => {
            expect(err).not.to.exist;
            expect(result).to.equal(cards);
            findChainMock.verify();
            done();
          });
        });
      });

      context("when it doesn't contain cards", () => {
        var cards = [];

        beforeEach(() => {
          findChainMock.yields(null, cards);
        });

        it('yields []', (done) => {
          doc.cards((err, result) => {
            expect(err).not.to.exist;
            expect(result).to.equal(cards);
            done();
          });
        });
      });

      context('when finding the cards yields an error', () => {
        var error = new Error('error finding cards');

        beforeEach(() => {
          findChainMock.yields(error);
        });

        it('yields the error', (done) => {
          doc.cards((err, result) => {
            expect(err).to.equal(error);
            expect(result).not.to.exist;
            done();
          });
        });
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
