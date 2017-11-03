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
  describe('startJob', () => {
    var job = {}
      , cards = ['card']
      , logger = {}
      ;

    beforeEach(() => {
      job.start = sandbox.stub();
      job.start.returns({
        then: () => {
          return {
            catch: () => {}
          }
        }
      });
      sandbox.stub(pngBatchJob, 'PngBatchJob').returns(job);
    });

    it('creates a PngBatchJob and starts it', () => {
      deckPdfMaker.startJob(cards, logger);
      expect(pngBatchJob.PngBatchJob).to.have.been.calledOnce
        .calledWith(cards, logger);
      expect(job.start).to.have.been.calledOnce;
    });
  });
});

