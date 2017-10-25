var PngBatchJob = require('_/png-batch-job').PngBatchJob
  , PDFDocument = require('pdfkit')
  ;

var jobs = {};
var deckPngs = {};

var pdfPtsPerInch = 72
  , cardWidth = pdfPtsPerInch * 2.5
  , cardHeight = pdfPtsPerInch * 3.5
  , spaceBetween = pdfPtsPerInch * .25
  , pageHeight = pdfPtsPerInch * 8.5
  , pageWidth = pdfPtsPerInch * 11
  , cardAreaHeight = 2 * cardHeight + spaceBetween
  , cardAreaWidth = 3 * cardWidth + 2 * spaceBetween
  , topMargin = (pageHeight - cardAreaHeight) / 2.0
  , leftMargin = (pageWidth - cardAreaWidth) / 2.0
  , cardsPerPage = 6
  , cardsPerRow = 3
  ;

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

function cardLocation(pageIndex) {
  var x
    , y
    , rowIndex
    ;

  if (pageIndex < cardsPerRow) {
    y = topMargin;
    rowIndex = pageIndex;
  } else {
    y = topMargin + cardHeight + spaceBetween;
    rowIndex = pageIndex - cardsPerRow;
  }

  if (rowIndex === 0) {
    x = leftMargin;
  } else {
    x = leftMargin + (cardWidth + spaceBetween) * rowIndex;
  }

  return {
    x: x,
    y: y
  };
}

function pipePdf(id, res) {
  var doc = new PDFDocument({
        autoFirstPage: false
      })
    , pngs = deckPngs[id]
    ;

  doc.pipe(res);

  pngs.forEach((png, i) => {
    var pageIndex = i % cardsPerPage
      , pageLocation = cardLocation(pageIndex)
      ;

    if (pageIndex === 0) {
      doc.addPage({
        layout: 'landscape'
      });
    }

    doc.image(png, pageLocation.x, pageLocation.y, { width: cardWidth });
  });

  doc.end();
}
module.exports.pipePdf = pipePdf;
