var reqlib = require('app-root-path').require
  , pngBatchJob = reqlib('lib/png-batch-job')
  , svg2png = require('svg2png')
  , PDFDocument = require('pdfkit')
  , cardBackStore = reqlib('lib/card-back-store')
  , JobStatus = reqlib('lib/models/job-status')
  , DeckPdfResult = reqlib('lib/models/deck-pdf-result')
  , concat = require('concat-stream')
  , SVGtoPDF = require('svg-to-pdfkit')
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

function finishJob(err, result, jobId, logger) {
  var status = err ? 'error' : 'done';

  logger.debug({ jobId: jobId}, 'finish job');

  if (err) {
    logger.error({ jobId: jobId }, 'failed to create DeckPdfResult');
  }

  return JobStatus.update({
    _id: jobId 
  }, {
    $set: {
      status: status
    }
  }).exec().catch((err) => {
    logger.error({ jobId: jobId, err: err }, 'error in DeckPdfMaker.finishJob'); 
  });
}

function createJob() {
  return JobStatus.create({
    status: 'running',
    type: 'deckPdf'
  }).then((jobStatus) => {
    return jobStatus._id
  });
}
module.exports.createJob = createJob;

function runJob(jobId, cards, logger) {
  logger.info({ jobId: jobId }, 'start deck pdf job')

  new pngBatchJob.PngBatchJob(cards, logger, svg2png, cardWidthInches)
    .start()
    .then((pngs) => {
      logger.debug({ jobId: jobId }, 'got pngs for deck pdf');
      var orderedPngs = cards.map((card) => {
            return pngs[card.id];
          })
        , writeStream = DeckPdfResult.buildWriteStream(jobId, (err, result) => {
            finishJob(err, result, jobId, logger);
          })
        ;

      makePdf(orderedPngs, writeStream, logger);
    }).catch((err) => {
      logger.error({ jobId: jobId, err: err }, 'DeckPdfMaker.runJob');
    });
}
module.exports.runJob = runJob;

function jobStatus(id) {
  return JobStatus.findOne({
    _id: id
  }).then((job) => {
    return (job && job.status) || 'dead';
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

function makePage(cards, doc, flip, type) {
  var location;

  doc.addPage({
    layout: 'landscape' 
  });
  
  if (flip) {
    doc.rotate(flipDegrees, { origin: [ doc.page.width / 2, doc.page.height / 2 ] });
  }

  cards.forEach((card, i) => {
    location = locations[i];
    if (type === 'svg') {
      SVGtoPDF(doc, card.toString(), location.x, location.y, { width: cardWidth, height: cardHeight });
    } else if (type === 'img') {
      doc.image(card, location.x, location.y, { width: cardWidth });
    } else {
      throw new TypeError('unrecognized type: ' + type);
    }

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

function makePdf(pngs, stream, logger) {
  var doc = new PDFDocument({
        autoFirstPage: false
      })
    , cardBack = cardBackStore.get('default')
    , pngsSlices
    ;

  logger.debug({}, 'streaming pdf');
  doc.pipe(stream);

  pngsSlices = new Array(Math.ceil(pngs.length * 1.0 / cardsPerPage));

  for (var i = 0; i < pngsSlices.length; i++) {
    pngsSlices[i] = pngs.slice(i * cardsPerPage, 
      Math.min((i + 1) * cardsPerPage, pngs.length));
  }

  pngsSlices.forEach((slice) => {
    makePage(slice, doc, false, 'svg');
    makePage(cardBacks(cardsPerPage, cardBack), doc, true, 'img');
  });

  doc.end();
}

