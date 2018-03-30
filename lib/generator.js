var reqlib = require('app-root-path').require;
/*
 * Module for generating svg from card data
 */

var templateSupplier = reqlib('lib/card-wrapper-template-supplier')
  , TemplateRenderer = reqlib('lib/template-renderer/template-renderer')
  , CardWrapper = reqlib('lib/template-renderer/card-wrapper')
  , svgCanvasSupplier = reqlib('lib/svg-canvas-supplier')
  , pngCanvasSupplierFactory = reqlib('lib/png-canvas-supplier-factory')
  , imageFetcher = reqlib('lib/image-fetcher')
  , textRenderer = reqlib('lib/opentype-text-renderer')
  ;

CardWrapper.setTemplateSupplier(templateSupplier);

/*
 * Takes a Card and generates an SVG
 *
 * Parameters:
 *   card - a valid Card
 *   cb - function(err, result)
 *
 * Result:
 *   A Buffer containing the SVG data
 */
module.exports.generateSvgHiRes = function(card, logger, cb) {
  generateHelper(card, svgCanvasSupplier, imageFetcher.hiRes, logger, cb);
}

module.exports.generateSvgLoRes = function(card, logger, cb) {
  generateHelper(card, svgCanvasSupplier, imageFetcher.loRes, logger, cb);
}

/*
 * Takes a Card and generates a PNG
 *
 * Parameters:
 *   card - a valid Card
 *   cb - function(err, result)
 *
 * Result:
 *   A Buffer containing the PNG data
 */
//module.exports.generatePng = function(card, width, logger, cb) {
//  var canvasSupplier = pngCanvasSupplierFactory.instance(width);
//  generateHelper(card, canvasSupplier, logger, cb);
//}


function generateHelper(card, canvasSupplier, imageFetcher, logger, cb) {
  var renderer = TemplateRenderer.new({
    canvasSupplier: canvasSupplier, 
    imageFetcher: imageFetcher,
    textRenderer: textRenderer
  });

  renderer.setLogger(logger);

  CardWrapper.newInstance(card, (err, wrapper) => {
    if (err) {
      return cb(err);
    }

    renderer.draw(wrapper, (err, canvas) => {
      if (err) return cb(err);

      cb(null, canvas.toBuffer());
    });
  });
}
