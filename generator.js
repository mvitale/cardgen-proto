/*
 * Module for generating svg from card data
 */

var templateReader = require('./template-reader');
var templateRenderer = require('./template-renderer/template-renderer');
var svgCanvasSupplier = require('./svg-canvas-supplier');
var pngCanvasSupplierFactory = require('./png-canvas-supplier-factory');
var imageFetcher = require('./image-fetcher');

templateRenderer.setTemplateSupplier(templateReader);
templateRenderer.setImageFetcher(imageFetcher);

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
module.exports.generateSvg = function(card, cb) {
  templateRenderer.setCanvasSupplier(svgCanvasSupplier);
  generateHelper(card, cb);
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
module.exports.generatePng = function(card, width, cb) {
  var canvasSupplier = pngCanvasSupplierFactory.instance(width);
  templateRenderer.setCanvasSupplier(canvasSupplier);
  generateHelper(card, cb);
}

function generateHelper(card, cb) {
  templateRenderer.setCard(card, (err) => {
    if (err) {
      return cb(err);
    }

    templateRenderer.draw((err, canvas) => {
      if (err) return cb(err);

      cb(null, canvas.toBuffer());
    });
  });
}
