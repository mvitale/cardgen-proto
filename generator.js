var templateReader = require('./template-reader');
var templateRenderer = require('./template-renderer/template-renderer');
var canvasSupplier = require('./canvas-supplier');
var imageFetcher = require('./image-fetcher');

templateRenderer.setTemplateSupplier(templateReader);
templateRenderer.setCanvasSupplier(canvasSupplier);
templateRenderer.setImageFetcher(imageFetcher);

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
