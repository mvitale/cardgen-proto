/*
 * Module for generating svg from card data
 */

var templateReader = require('./template-reader');
var templateRenderer = require('./template-renderer/template-renderer');
var canvasSupplier = require('./canvas-supplier');
var imageFetcher = require('./image-fetcher');

templateRenderer.setTemplateSupplier(templateReader);
templateRenderer.setCanvasSupplier(canvasSupplier);
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
module.exports.generate = function generate(card, cb) {
  templateRenderer.setCard(card, (err) => {
    if (err) {
      return cb(err);
    }

    templateRenderer.draw((err, canvas) => {
      if (err) return cb(err);

      cb(null, canvas.toBuffer());
    });
  })
}
