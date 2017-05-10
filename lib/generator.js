/*
 * Module for generating svg from card data
 */

var templateReader = require('_/template-reader');
var TemplateRenderer = require('_/template-renderer/template-renderer');
var svgCanvasSupplier = require('_/svg-canvas-supplier');
var pngCanvasSupplierFactory = require('_/png-canvas-supplier-factory');
var imageFetcher = require('_/image-fetcher');

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
  var renderer =
    new TemplateRenderer(templateReader, svgCanvasSupplier, imageFetcher);

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
  renderer.setCard(card, (err) => {
    if (err) {
      return cb(err);
    }

    renderer.draw((err, canvas) => {
      if (err) return cb(err);

      cb(null, canvas.toBuffer());
    });
  });
}
