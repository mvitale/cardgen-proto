var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , svgCanvasSupplier = require('_/svg-canvas-supplier')
  , TemplateRenderer = require('_/template-renderer/template-renderer')
  , CardWrapper = require('_/template-renderer/card-wrapper')
  , imageFetcher = require('_/image-fetcher')
  ;

var generator = require('_/generator');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('generator', () => {
  describe('#generateSvg', () => {
    var templateRenderer
      , cardWrapper
      , canvas
      , cb
      , card = {
          id: 1234
        }
      , cardWrapper = {
          card: card
        }
      , logger
      , newTemplateRenderer
      , newCardWrapper
      ;

    beforeEach(() => {
      templateRenderer = {}
      templateRenderer.setLogger = sandbox.spy();
      templateRenderer.draw = sandbox.stub()
      newCardWrapper = sandbox.stub(CardWrapper, 'newInstance')
      newTemplateRenderer = sandbox.stub(TemplateRenderer, 'new')
      newTemplateRenderer.returns(templateRenderer);
      cb = sandbox.spy();
      logger = sandbox.stub();
    });

    context('success pathway', () => {
      var buffer = 'asdf';

      beforeEach(() => {
        newCardWrapper.yields(null, cardWrapper)
        canvas = {
          toBuffer: sandbox.stub().returns(buffer)
        };
        templateRenderer.draw.yields(null, canvas);

        generator.generateSvg(card, logger, cb);
      });

      it('makes the expected calls to its depencencies', () => {
        expect(newTemplateRenderer).to.have.been.calledOnce.calledWith(
          svgCanvasSupplier, imageFetcher);
        expect(templateRenderer.setLogger).to.have.been.calledOnce
          .calledWith(logger);
        expect(newCardWrapper).to.have.been.calledOnce.calledWith(card);
        expect(templateRenderer.draw).to.have.been.calledOnce.calledWith(
          cardWrapper);
      });

      it('yields the result of canvas.toBuffer()', () => {
        expect(cb).to.have.been.calledOnce.calledWith(null, buffer);
      });
    });

    context('when CardWrapper.newInstance yields an error', () => {
      var err = new Error('CardWrapper.newInstance failed');

      beforeEach(() => {
        newCardWrapper.yields(err);
        generator.generateSvg(card, logger, cb);
      });

      it('yields the error', () => {
        expect(cb).to.have.been.calledOnce.calledWith(err);
      })
    });

    context('when renderer.draw yields an error', () => {
      var err = new Error('renderer.draw failed');

      beforeEach(() => {
        newCardWrapper.yields(null, cardWrapper);
        templateRenderer.draw.yields(err);
        generator.generateSvg(card, logger, cb);
      });

      it('yields the error', () => {
        expect(cb).to.have.been.calledOnce.calledWith(err);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
