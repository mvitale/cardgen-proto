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
    , cards
    , pngs    
    , logger = {
        info: () => {},
        error: () => {}
      }
    , jobError = new Error('job failed')
    , numCards = 7
    ;

  beforeEach(() => {
    var cardId;

    cards = new Array(numCards);
    pngs = {};

    for (var i = 0; i < numCards; i++) {
      cardId = 'card' + i;
      cards[i] = {
        id: cardId
      };
      pngs[cardId] = 'png' + i; 
    }
  });

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
    job.start.resolves(pngs);
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

  describe('#pipePdf', () => {
    var pdfConstructor
      , pdf
      ;

    beforeEach((done) => {
      pdf = {
        pipe: sandbox.spy(),
        addPage: sandbox.spy(),
        image: sandbox.spy(),
        end: sandbox.spy()
      };
      pdfConstructor = sandbox.stub().returns(pdf);

      setupResolvingJob();
      deckPdfMaker.startJob(cards, logger);
      process.nextTick(done);
    });

    context('when the PNGs are in cache', () => {

      it('invokes the expected functions on the PDF', () => {
        var res = {
          response: 'yes'
        };

        deckPdfMaker.pipePdf(jobId, res, pdfConstructor);
        expect(pdf.pipe).to.have.been.calledOnce.calledWith(res);

        cards.forEach((card) => {
          expect(pdf.image).to.have.been.calledWith(pngs[card.id]);
        });
        // TODO: rather than test the coordinates of the calls here, unit test the cardLocation method and make sure its results are passed here
      });
    });

    context("when the PNGs aren't in cache", () => {
      it('throws an error', () => {
        expect(() => { deckPdfMaker.pipePdf('missingjob', {}, pdfConstructor) })
          .to.throw;
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});

