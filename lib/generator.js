/*
 * Module for generating svg from card data
 */

var templateReader = require('_/template-reader')
  , TemplateRenderer = require('_/template-renderer/template-renderer')
  , CardWrapper = require('_/template-renderer/card-wrapper')
  , svgCanvasSupplier = require('_/svg-canvas-supplier')
  , pngCanvasSupplierFactory = require('_/png-canvas-supplier-factory')
  , imageFetcher = require('_/image-fetcher')
  ;

CardWrapper.setTemplateSupplier(templateReader);

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
module.exports.generateSvg = function(card, logger, cb) {
  var renderer =
    new TemplateRenderer(svgCanvasSupplier, imageFetcher);

  renderer.setLogger(logger);

  generateHelper(card, renderer, cb);
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
 *
module.exports.generatePng = function(card, width, cb) {
  var canvasSupplier = pngCanvasSupplierFactory.instance(width);
  templateRenderer.setCanvasSupplier(canvasSupplier);
  generateHelper(card, cb);
}
*/

function generateHelper(card, renderer, cb) {
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
