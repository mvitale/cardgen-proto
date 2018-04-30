var reqlib = require('app-root-path').require
  , pngBatchJob = reqlib('lib/png-batch-job')
  , svg2png = require('svg2png')
  , uuid = require('uuid')
  , PDFDocument = require('pdfkit')
  , cardBackStore = reqlib('lib/card-back-store')
  , JobStatus = reqlib('lib/models/job-status')
  , DeckPdfResult = reqlib('lib/models/deck-pdf-result')
  , concat = require('concat-stream')
  ;

var pngTtlSecs = 60 * 5
  , jobTtlSecs = 60 * 5
  ;

// The order of the dimension constants is significant since they
// build on each other (cardLocations uses all of them).
var pdfPtsPerInch = 72
  , cardWidthInches = 2.74
  , cardWidth = pdfPtsPerInch * cardWidthInches
  , cardHeight = pdfPtsPerInch * 3.74
  , spaceBetween = pdfPtsPerInch * .25
  , pageHeight = pdfPtsPerInch * 8.5
  , pageWidth = pdfPtsPerInch * 11
  , cardsPerPage = 6
  , cardsPerRow = 3
  , cardsPerCol = Math.ceil(cardsPerPage / cardsPerRow)
  , locations = cardLocations()
  , cropOffset = pdfPtsPerInch * .24 / 2
  , cropLineLength = pdfPtsPerInch * .1
  , flipDegrees = 180
  , cropColor = "#f8f8f8"
  ;

function init() {
  cardBacks[defaultCardBack] = cardBack;
}
module.exports.init = init;

function finishJob(jobId, pdfBuf, logger) {
  DeckPdfResult.create({
    jobId: jobId,
    result: pdfBuf
  }).then((result) => {
    return JobStatus.update({
      jobId: jobId 
    }, {
      $set: {
        status: 'done'
      }
    }).exec();
  })
  .catch((e) => {
    logger.error({ jobId: jobId, error: e }, 'DeckPdfMaker.finishJob'); 
  });
}

function startJob(cards, logger) {
  var pngJob = new pngBatchJob.PngBatchJob(cards, logger, svg2png, uuid, cardWidthInches)
    , jobId = pngJob.id()
    ;

  JobStatus.create({
    status: 'running',
    jobId: jobId
  }).then((job) => {
    return pngJob.start();
  }).then((pngs) => {
    var orderedPngs = cards.map((card) => {
          return pngs[card.id];
        })
      , concatStream = concat((pdf) => finishJob(jobId, pdf))
      ;

    makePdf(orderedPngs, concatStream);
  }).catch((err) => {
    logger.error({ jobId: jobId, error: err }, 'DeckPdfMaker.startJob');
  });

  return jobId;
}
module.exports.startJob = startJob;

function jobStatus(id) {
  return JobStatus.findOne({
    jobId: id
  }).then((job) => {
    var status = job.status;

    if (!status) {
      status = 'dead';
    }

    return status;
  });
}
module.exports.jobStatus = jobStatus;

function cardLocations() {
  var drawingWidth = 
        cardsPerRow * cardWidth + spaceBetween * (cardsPerRow - 1)
    , drawingHeight = 
        cardsPerCol * cardHeight + spaceBetween * (cardsPerCol - 1)
    , startX = (pageWidth - drawingWidth) / 2
    , startY = (pageHeight - drawingHeight) / 2
    , locations = new Array(cardsPerPage)
    , x = startX
    , y = startY
    ;

  for (var i = 0; i < cardsPerPage; i++) {
    if (i % cardsPerRow === 0) {
      if (i > 0) {
        y += cardHeight + spaceBetween;
      }

      x = startX;
    } else {
      x += cardWidth + spaceBetween
    }

    locations[i] = { x: x, y: y };
  }

  return locations;
}

function makePage(cards, doc, flip) {
  var location;

  doc.addPage({
    layout: 'landscape' 
  });
  
  if (flip) {
    doc.rotate(flipDegrees, { origin: [ doc.page.width / 2, doc.page.height / 2 ] });
  }

  cards.forEach((card, i) => {
    location = locations[i];
    doc.image(card, location.x, location.y, { width: cardWidth });

    cropMark(doc, location.x + cropOffset, location.y + cropOffset);
    cropMark(doc, location.x + cardWidth - cropOffset, location.y + cropOffset);
    cropMark(doc, location.x + cropOffset, location.y + cardHeight - cropOffset);
    cropMark(doc, location.x + cardWidth - cropOffset, location.y + cardHeight - cropOffset);
  });
}

function cropMark(doc, x, y) {
    doc.moveTo(x - cropLineLength, y)
      .lineTo(x + cropLineLength, y)
      .stroke(cropColor)
      .moveTo(x, y - cropLineLength)
      .lineTo(x , y + cropLineLength)
      .stroke(cropColor);
}

function cardBacks(n, cardBack) {
  var result = new Array(n);
  result.fill(cardBack);
  return result;
}

function makePdf(pngs, stream) {
  var doc = new PDFDocument({
        autoFirstPage: false
      })
    , cardBack = cardBackStore.get('default')
    , pngsSlices
    ;

  doc.pipe(stream);

  pngsSlices = new Array(Math.ceil(pngs.length * 1.0 / cardsPerPage));

  for (var i = 0; i < pngsSlices.length; i++) {
    pngsSlices[i] = pngs.slice(i * cardsPerPage, 
      Math.min((i + 1) * cardsPerPage, pngs.length));
  }

  pngsSlices.forEach((slice) => {
    makePage(slice, doc, false);
    makePage(cardBacks(cardsPerPage, cardBack), doc, true);
  });

  doc.end();
}

function pdfResult(jobId) {
  return DeckPdfResult.findOne({
    jobId: jobId
  }).then((result) => {
    return result.result;
  });
}
module.exports.pdfResult = pdfResult;

