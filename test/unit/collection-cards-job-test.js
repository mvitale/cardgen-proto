var reqlib = require('app-root-path').require;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;

var CollectionCardsJob = reqlib('lib/collection-cards-job')
  , Card = reqlib('lib/models/card')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('CollectionCardsJob', () => {
  var appId = 'app'
    , userId = 42
    , locale = 'fr'
    , deck = 'my-deck'
    , taxonId1 = '1234'
    , taxonId2 = '5678'
    , taxonIds = [taxonId1, taxonId2]
    , parentLog = {
        child: () => {
          return {
            info: sandbox.spy(),
            error: sandbox.spy()
          }
        }
      }
    , populateDefaultsAndChoices
    , save
    , successCard
    , job
    , newCard
    ;

  function newCardOptions(taxonId) {
    return {
      templateName: 'trait',
      templateParams: {
        speciesId: taxonId
      },
      userId: userId,
      appId: appId,
      locale: locale,
      _deck: deck
    }
  }

  beforeEach(() => {
    job = CollectionCardsJob.new(appId, userId, locale, deck, taxonIds,
       parentLog);
    populateDefaultsAndChoices = sinon.stub();
    populateDefaultsAndChoices.yields();
    save = sinon.stub();
    successCard = {
      populateDefaultsAndChoices: populateDefaultsAndChoices,
      save: save
    };
    save.yields(null, successCard);
    newCard = sandbox.stub(Card, 'new');
  });

  context('before job has been started', () => {
    it('status returns "created"', () => {
      expect(job.status()).to.equal('created');
    });
  });

  context('when job has been started but has\'t finished', () => {
    beforeEach(() => {
      var stallCard = {
        populateDefaultsAndChoices: sandbox.stub()
      }
      newCard.returns(stallCard);
    });

    it('status returns "running"', () => {
      job.start();
      expect(job.status()).to.equal('running');
    });
  });

  context('when all cards should be successfully created', () => {
    beforeEach(() => {
      newCard.returns(successCard);
      job.start();
    });

    it('calls dependencies with expected arguments', () => {
      process.nextTick(() => {
        var newCardCalls = newCard.getCalls();

        expect(newCard).to.have.been.calledTwice;
        expect(newCardCalls[0].args).to.eql([newCardOptions(taxonId1)]);
        expect(newCardCalls[1].args).to.eql([newCardOptions(taxonId2)]);
        expect(save).to.have.been.calledTwice;
      });
    });

    describe('#status', () => {
      it('returns "done"', () => {
        process.nextTick(() => {
          expect(job.status()).to.equal('done');
        });
      });
    });

    describe('#cards', () => {
      it('returns them', () => {
        process.nextTick(() => {
          expect(job.cards()).to.eql([successCard, successCard]);
        });
      });
    });

    describe('#failedIds', () => {
      it('returns []', () => {
        process.nextTick(() => {
          expect(job.failedIds()).to.eql([]);
        });
      });
    });
  });

  context('when populateDefaultsAndChoices fails for one of the cards', () => {
    var failPopulate
      , failCard
      ;

    beforeEach(() => {
      failPopulate = sandbox.stub();
      failPopulate.yields(new Error('populateDefaultsAndChoices failed'));
      failCard = {
          populateDefaultsAndChoices: failPopulate
      };
      newCard.withArgs(newCardOptions(taxonId1)).returns(failCard);
      newCard.withArgs(newCardOptions(taxonId2)).returns(successCard);
      job.start();
    });

    describe('#status', () => {
      it('returns "done"', () => {
        process.nextTick(() => {
          expect(job.status()).to.equal('done');
        });
      });
    });

    describe('#cards', () => {
      it('returns the successful one', () => {
        process.nextTick(() => {
          expect(job.cards()).to.eql([successCard])
        });
      });
    });

    describe('#failedIds', () => {
      it('returns the id of the failed card', () => {
        process.nextTick(() => {
          expect(job.failedIds()).to.eql([taxonId1]);
        });
      });
    });
  });

  context('when save fails for one of the cards', () => {
    var failSave
      , failCard
      ;

    beforeEach(() => {
      failSave = sandbox.stub();
      failSave.yields(new Error('failed to save card'));
      failCard = {
        populateDefaultsAndChoices: populateDefaultsAndChoices,
        save: failSave
      }
      newCard.withArgs(newCardOptions(taxonId1)).returns(successCard);
      newCard.withArgs(newCardOptions(taxonId2)).returns(failCard);
      job.start();
    });

    describe('#status', () => {
      it('returns "done"', () => {
        process.nextTick(() => {
          expect(job.status()).to.equal('done');
        });
      });
    });

    describe('#cards', () => {
      it('returns the ok card', () => {
        process.nextTick(() => {
          expect(job.cards()).to.equal([successCard]);
        });
      });
    });

    describe('#failedIds', () => {
      it('returns the id of the failed card', () => {
        process.nextTick(() => {
          expect(job.failedIds()).to.equal([taxonId2]);
        });
      });
    });
  });

  describe('#start', () => {
    context('when job is already started', () => {
      it('throws an TypeError', () => {
        job.start();
        expect(() => job.start()).to.throw(TypeError, 'job already started');
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
