var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , PngBatchJob = require('_/png-batch-job').PngBatchJob
  , generator = require('_/generator')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('png-batch-job', () => {
  var cards = [
        { id: 'id1' },
        { id: 'id2' }
      ]
    , logger = {}
    , jobId = 'jobid'
    , idFn = () => {
        return jobId;
      }
    , svg2png
    , job
    ;

  describe('#start', () => {
    beforeEach(() => {
      svg2png = sandbox.stub();
      sandbox.stub(generator, 'generateSvg');
      job = new PngBatchJob(cards, logger, svg2png, idFn);
    });

    it('returns a Promise and calls generateSvg once for each card', () => {
      expect(job.start()).to.be.a('promise');
      expect(generator.generateSvg).to.have.been.calledTwice
        .calledWith(cards[0], logger)
        .calledWith(cards[1], logger)
        ;
    });

    context('when all SVGs are successfully generated', () => {
      var svg1 = {
            type: 'svg',
            belongsTo: 'card0'
          }
        , svg2 = {
            type: 'svg',
            belongsTo: 'card1'
          }
        , png1 = {
              type: 'png',
              belongsTo: 'card0'
          }
        , png2 = {
            type: 'png',
            belongsTo: 'card1'
          }
        ;

      beforeEach(() => {
        generator.generateSvg.withArgs(cards[0]).yields(null, svg1);
        generator.generateSvg.withArgs(cards[1]).yields(null, svg2);
      });

      context('when all SVGs can be successfully converted to PNGs', () => {
        beforeEach(() => {
          svg2png.withArgs(svg1).resolves(png1);
          svg2png.withArgs(svg2).resolves(png2);
        });

        it('calls svg2png with each svg and the correct options ', () => {
          var expectedWidth = 750;
          job.start();
          expect(svg2png).to.have.been.calledTwice
            .calledWith(svg1, { width: expectedWidth })
            .calledWith(svg2, { width: expectedWidth });
        });

        it('resolves with the PNGs', () => {
          return job.start().then((pngs) => {
            expect(pngs[cards[0].id]).to.exist;
            expect(pngs[cards[0].id]).to.equal(png1);
            expect(pngs[cards[1].id]).to.exist;
            expect(pngs[cards[1].id]).to.equal(png2);
          });
        });
      });

      context('when an SVG conversion fails', () => {
        var error = new Error('Failed to convert SVG');
        beforeEach(() => {
          svg2png.withArgs(svg1).resolves(png1);
          svg2png.withArgs(svg2).rejects(error);
        });

        it('rejects with the error', () => {
          return job.start().catch((theError) => {
            expect(theError).to.equal(error);
          });
        });
      });
    });

    context('when generator fails for a card', () => {
      var svg = {
            type: 'svg'  
          }
        , png = {
            type: 'png'
          }
        , error = new Error('failed to generate SVG')
        ;

      beforeEach(() => {
        generator.generateSvg.withArgs(cards[0]).yields(null, svg);
        generator.generateSvg.withArgs(cards[1]).yields(error);
        svg2png.resolves(png);
      });

      it('rejects with the error', () => {
        return job.start().catch((theError) => {
          expect(theError).to.equal(error);
        });
      });
    });
  });

  describe('#id', () => {
    it('returns the result returned by idFn, each time', () => {
      expect(job.id()).to.equal(jobId);
      expect(job.id()).to.equal(jobId);
    });
  });
});

afterEach(() => {
  sandbox.restore();
});

