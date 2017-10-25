var PngBatchJob = require('_/png-batch-job').PngBatchJob
  , PDFDocument = require('pdfkit')
  ;

var jobs = {};
var deckPngs = {};

var page

function startJob(cards, logger) {
  var job = new PngBatchJob(cards, logger);
  jobs[job.id] = job;
  job.start()
    .then((pngs) => {
      var orderedPngs = cards.map((card) => {
        return pngs[card.id];
      });
      deckPngs[job.id] = orderedPngs;
      delete jobs[job.id];
    })
    .catch((err) => {
      logger.error(err);
      delete jobs[job.id];
    });

  return job.id;
}
module.exports.startJob = startJob;

function pipePdf(id, res) {
  var doc = new PDFDocument({
        autoFirstPage: false
      })
    , pngs = deckPngs[id]
    ;

  doc.pipe(res);

  pngs.forEach((png) => {
    doc.addPage({
      layout: 'landscape'
    });
    doc.image(png, 20, 20);
  });

  doc.end();
}
module.exports.pipePdf = pipePdf;
