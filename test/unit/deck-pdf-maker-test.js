var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , deckPdfMaker = require('_/deck-pdf-maker')
  , pngBatchJob = require('_/png-batch-job')
  , svg2png = require('svg2png')
  , uuid = require('uuid')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('deck-pdf-maker', () => {
  var jobId = 'jobid'
    , job = {
        id: () => {
          return jobId 
        }
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
    var constructorCall;

    beforeEach(setupNonFinishingJob);

    it('creates a PngBatchJob and starts it', () => {
      deckPdfMaker.startJob(cards, logger);
      expect(pngBatchJob.PngBatchJob).to.have.been.calledOnce;
      constructorCall = pngBatchJob.PngBatchJob.getCalls()[0];
      expect(constructorCall.args[0]).to.equal(cards);
      expect(constructorCall.args[1]).to.equal(logger);
      expect(constructorCall.args[2]).to.eql(svg2png);
      expect(constructorCall.args[3]).to.eql(uuid);
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
            }
          , back = {
              type: 'cardBack'
            }
          , expectedCalls = [
              [
                pngs[cards[0].id], 
                {x:108, y:45}
              ],
              [
                pngs[cards[1].id],
                {x:306, y:45}
              ],
              [
                pngs[cards[2].id],
                {x:504, y:45}
              ],
              [
                pngs[cards[3].id],
                {x:108, y:315}
              ],
              [
                pngs[cards[4].id],
                {x:306, y:315}
              ],
              [
                pngs[cards[5].id],
                {x:504, y:315}
              ],
              [
                back, 
                {x:108, y:45}
              ],
              [
                back,
                {x:306, y:45}
              ],
              [
                back,
                {x:504, y:45}
              ],
              [
                back,
                {x:108, y:315}
              ],
              [
                back,
                {x:306, y:315}
              ],
              [
                back,
                {x:504, y:315}
              ],
              [
                pngs[cards[6].id],
                {x:108, y:45}
              ],
              [
                back, 
                {x:108, y:45}
              ],
            ]
          , imageCalls
          , curCall
          , curCard
          ;

        deckPdfMaker.pipePdf(jobId, res, pdfConstructor, back);
        expect(pdf.pipe).to.have.been.calledOnce.calledWith(res);
        imageCalls = pdf.image.getCalls();
        expect(imageCalls.length).to.equal(expectedCalls.length);
        
        for (var i = 0; i < imageCalls.length; i++) {
          curCall = imageCalls[i];
          expectedCall = expectedCalls[i];

          expect(curCall.args[0]).to.equal(expectedCall[0]);
          expect(curCall.args[1]).to.equal(expectedCall[1].x);
          expect(curCall.args[2]).to.equal(expectedCall[1].y);
          expect(curCall.args[3]).to.eql({
            width: 180
          });
        }

        expect(pdf.end).to.have.been.calledOnce;
      });
    });

    context("when the PNGs aren't in cache", () => {
      it('throws an error', () => {
        expect(() => { deckPdfMaker.pipePdf('missingjob', {}, pdfConstructor) })
          .to.throw('Results for job id missingjob not found');
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});

