var reqlib = require('app-root-path').require
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , generator = reqlib('lib/generator')
  , PDFDocument = require('pdfkit')
  , cardBackStore = reqlib('lib/card-back-store')
  , JobStatus = reqlib('lib/models/job-status')
  , Deck = reqlib('lib/models/deck')
  , DeckPdfResult = reqlib('lib/models/deck-pdf-result')
  , concat = require('concat-stream')
  , generator = reqlib('lib/generator')
  , dimensions = reqlib('lib/util/dimensions')
  ;

var pdfJobSchema = new Schema({
  appId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  deck: {
    type: Schema.Types.ObjectId,
    ref: 'Deck'
  },
  backId: {
    type: String
  }
});

var pdfPtsPerInch = 72
  , cardWidthInches = dimensions.cardWidthInches
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


function finishJob(err, result, logger) {
  var status = err ? 'error' : 'done';

  logger.debug({ }, 'finish job');

  if (err) {
    logger.error({ }, 'failed to create DeckPdfResult');
  }

  this.status = status;
  return this.save();
}
pdfJobSchema.methods.finishJob = finishJob;

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
  });
}

function run(baseLogger) {
  var logger = baseLogger.child({ jobId: this._id });
  logger.info({}, 'start deck pdf job')
  Deck.findOne({
    _id: this.deck
  }).then((deck) => {
    return generator.generateDeckPngs(deck, {
      safeSpaceLines: true 
    });
  }).then((pngs) => {
    logger.debug({}, 'got pngs for deck pdf');
      var writeStream = DeckPdfResult.buildWriteStream(this._id, (err, result) => {
          this.finishJob(err, result, logger);
        })
      ;

    makePdf(pngs, writeStream, this.backId, logger);
  }).catch((err) => {
    logger.error({ err: err}, 'job failed');
    this.status = 'error';
    this.save();
  });
}
pdfJobSchema.methods.run = run;

module.exports = mongoose.model('PdfJob', pdfJobSchema);

