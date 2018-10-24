var reqlib = require('app-root-path').require
  , svg2png = require('svg2png')
  ;

var ppi = 300;

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
function generateSvgHiRes(card, options, logger, cb) {
  generateHelper(card, svgCanvasSupplier, imageFetcher.hiRes, options, logger, cb);
}
module.exports.generateSvgHiRes = generateSvgHiRes;

function generateSvgLoRes(card, options, logger, cb) {
  generateHelper(card, svgCanvasSupplier, imageFetcher.loRes, options, logger, cb);
}
module.exports.generateSvgLoRes = generateSvgLoRes;

function generatePng(card, options, logger) {
  return new Promise((resolve, reject) => {
    generateSvgHiRes(card, {}, logger, (err, svg) => {
      if (err) {
        return reject(err);
      }

      svg2png(svg, options.widthInches * ppi)
      .then(resolve)
      .catch(reject);
    })
  });
}
module.exports.generatePng = generatePng;

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


function generateHelper(card, canvasSupplier, imageFetcher, options, logger, cb) {
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

    renderer.draw(wrapper, options, (err, canvas) => {
      if (err) return cb(err);

      cb(null, canvas.toBuffer());
    });
  });
}
