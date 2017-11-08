var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , svgCanvasSupplier = require('_/svg-canvas-supplier')
  , TemplateRenderer = require('_/template-renderer/template-renderer')
  , CardWrapper = require('_/template-renderer/card-wrapper')
  , imageFetcher = require('_/image-fetcher')
  , generator = require('_/generator')
  , pngCanvasSupplierFactory = require('_/png-canvas-supplier-factory')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('generator', () => {
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
    , buffer = 'asdf'
    , cardWrapperErr = new Error('CardWrapper.newInstance failed')
    , drawErr = new Error('renderer.draw failed')
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

  function successPathwaySetup() {
    newCardWrapper.yields(null, cardWrapper)
    canvas = {
      toBuffer: sandbox.stub().returns(buffer)
    };
    templateRenderer.draw.yields(null, canvas);
  }

  function itBehavesLikeSuccess(canvasSupplier) {
    it('calls the expected dependencies', () => {
      expect(newTemplateRenderer).to.have.been.calledOnce.calledWith(
        canvasSupplier, imageFetcher);
      expect(templateRenderer.setLogger).to.have.been.calledOnce
        .calledWith(logger);
      expect(newCardWrapper).to.have.been.calledOnce.calledWith(card);
      expect(templateRenderer.draw).to.have.been.calledOnce.calledWith(
        cardWrapper);
    });

    it('yields the result of canvas.toBuffer()', () => {
      expect(cb).to.have.been.calledOnce.calledWith(null, buffer);
    });
  }

  function itBehavesLikeCardWrapperError() {
    it('yields the error', () => {
      expect(cb).to.have.been.calledOnce.calledWith(cardWrapperErr);
    });
  }

  function cardWrapperErrorSetup() {
    newCardWrapper.yields(cardWrapperErr);
  }

  function drawErrorSetup() {
    newCardWrapper.yields(null, cardWrapper);
    templateRenderer.draw.yields(drawErr);
  }

  function itBehavesLikeDrawError() {
    it('yields the error', () => {
      expect(cb).to.have.been.calledOnce.calledWith(drawErr);
    });
  }

  describe('#generateSvg', () => {
    context('success pathway', () => {
      beforeEach(() => {
        successPathwaySetup();
        generator.generateSvg(card, logger, cb);
      });

      itBehavesLikeSuccess(svgCanvasSupplier);
    });

    context('when CardWrapper.newInstance yields an error', () => {
      beforeEach(() => {
        cardWrapperErrorSetup();
        generator.generateSvg(card, logger, cb);
      });

      itBehavesLikeCardWrapperError();
    });

    context('when renderer.draw yields an error', () => {
      beforeEach(() => {
        drawErrorSetup();
        generator.generateSvg(card, logger, cb);
      });

      itBehavesLikeDrawError();
    });
  });

  describe('#generatePng', () => {
    var width = 300;

    context('success pathway', () => {
      var pngCanvasSupplier = sandbox.stub();

      beforeEach(() => {
        successPathwaySetup();
        sandbox.stub(pngCanvasSupplierFactory, 'instance').returns(
          pngCanvasSupplier
        );
        generator.generatePng(card, width, logger, cb);
      });

      itBehavesLikeSuccess(pngCanvasSupplier);

      it('calls pngCanvasSupplierFactory with the correct width', () => {
        expect(pngCanvasSupplierFactory.instance).to.have.been.calledOnce
          .calledWith(width);
      });
    });

    context('when CardWrapper.newInstance yields an error', () => {
      beforeEach(() => {
        cardWrapperErrorSetup();
        generator.generatePng(card, width, logger, cb);
      });

      itBehavesLikeCardWrapperError();
    });

    context('when renderer.draw yields an error', () => {
      beforeEach(() => {
        drawErrorSetup();
        generator.generatePng(card, width, logger, cb);
      });

      itBehavesLikeDrawError();
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
