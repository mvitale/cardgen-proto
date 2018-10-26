var reqlib = require('app-root-path').require
  , PDFDocument = require('pdfkit')
  , cardBackStore = reqlib('lib/card-back-store')
  , JobStatus = reqlib('lib/models/job-status')
  , DeckPdfResult = reqlib('lib/models/deck-pdf-result')
  , concat = require('concat-stream')
  , generator = reqlib('lib/generator')
  ;

var pdfPtsPerInch = 72
  , cardWidthInches = 3
  , cardWidth = pdfPtsPerInch * cardWidthInches
  , cardHeight = pdfPtsPerInch * 4
  , spaceBetween = pdfPtsPerInch * .15
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
  }).exec().catch((e) => {
    logger.error({ jobId: jobId, error: e }, 'DeckPdfMaker.finishJob'); 
  });
}

function createJob(deckId, backId) {
  return JobStatus.create({
    status: 'running',
    type: 'deckPdf'
  }).then((jobStatus) => {
    return jobStatus._id
  });
}
module.exports.createJob = createJob;

function runJob(jobId, deck, backId, logger) {
  logger.info({ jobId: jobId }, 'start deck pdf job')

  return deck.cards()
  .then((cards) => {
    if (!cards.length) {
      throw new TypeError('no cards found in deck');
    }

    return Promise.all(cards.map((card) => {
      return generator.generatePng(card, { 
        widthInches: cardWidthInches, 
        safeSpaceLines: true
      }, logger)
    }))
  }).then((pngs) => {
    logger.debug({ jobId: jobId }, 'got pngs for deck pdf');
      var writeStream = DeckPdfResult.buildWriteStream(jobId, (err, result) => {
          finishJob(err, result, jobId, logger);
        })
      ;

    makePdf(pngs, writeStream, backId, logger);
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
    doc.image(card, location.x, location.y, { width: cardWidth , height: cardHeight });

    /*
    cropMark(doc, location.x + cropOffset, location.y + cropOffset);
    cropMark(doc, location.x + cardWidth - cropOffset, location.y + cropOffset);
    cropMark(doc, location.x + cropOffset, location.y + cardHeight - cropOffset);
    cropMark(doc, location.x + cardWidth - cropOffset, location.y + cardHeight - cropOffset);
    */
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

function makePdf(pngs, stream, backId, logger) {
  var doc = new PDFDocument({
        autoFirstPage: false
      })
    , cardBack = backId ? cardBackStore.get(backId) : null
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
    makePage(slice, doc, false);

    if (cardBack) {
      makePage(cardBacks(cardsPerPage, cardBack), doc, true);
    }
  });

  doc.end();
}

