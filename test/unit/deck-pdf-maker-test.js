var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , deckPdfMaker = require('_/deck-pdf-maker')
  , pngBatchJob = require('_/png-batch-job')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe.only('deck-pdf-maker', () => {
  var jobId = 'jobid'
    , job = {
        id: jobId 
      }
    , cardId1 = 'card1'
    , cardId2 = 'card2'
    , card1 = {
        id: cardId1
      }
    , card2 = {
        id: cardId2
      }
    , cards = [card1, card2]
    , logger = {}
    , jobError = new Error('job failed')
    ;

  function jobSetupBefore() {
    job.start = sandbox.stub();
  }

  function setupNonFinishingJob() {
    jobSetupBefore();
    job.start.returns({
      then: () => {
        return {
          catch: () => {}
        }
      }
    });
    jobSetupAfter();
  }

  function setupResolvingJob() {
    jobSetupBefore();
    job.start.resolves({
      [cardId1]: 'png1',
      [cardId2]: 'png2'
    });
    jobSetupAfter();
  }

  function setupRejectingJob() {
    jobSetupBefore();
    job.start.rejects(jobError);
    jobSetupAfter();
  }

  function jobSetupAfter() {
    sandbox.stub(pngBatchJob, 'PngBatchJob').returns(job);
  }

  describe('#startJob', () => {
    beforeEach(setupNonFinishingJob);

    it('creates a PngBatchJob and starts it', () => {
      deckPdfMaker.startJob(cards, logger);
      expect(pngBatchJob.PngBatchJob).to.have.been.calledOnce
        .calledWith(cards, logger);
      expect(job.start).to.have.been.calledOnce;
    });
  });

  describe('#jobStatus', () => {
    context("when the job has been created but hasn't finished", () => {
      beforeEach(setupNonFinishingJob);

      it('returns "running"', () => {
        deckPdfMaker.startJob(cards, logger); 
        expect(deckPdfMaker.jobStatus(jobId)).to.equal('running'); 
      });
    });

    context('when the job resolves', () => {
      beforeEach(setupResolvingJob);

      it('returns "done"', () => {
        deckPdfMaker.startJob(cards, logger);
        process.nextTick(() => {
          expect(deckPdfMaker.jobStatus(jobId)).to.equal('done');
        });
      });
    });

    context('when the job rejects', () => {
      beforeEach(setupRejectingJob);

      it('returns "dead"', () => {
        deckPdfMaker.startJob(cards, logger);
        process.nextTick(() => {
          expect(deckPdfMaker.jobStatus(jobId)).to.equal('dead');
        });
      });
    });

    context("when the job doesn't exist", () => {
      it('returns "dead"', () => {
        expect(deckPdfMaker.jobStatus('notajobid')).to.equal('dead');
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});

