var reqlib = require('app-root-path').require
  , pngBatchJob = reqlib('lib/png-batch-job')
  , LRU = require('lru-cache')
  , svg2png = require('svg2png')
  , uuid = require('uuid')
  , PDFDocument = require('pdfkit')
  , memcached = reqlib('lib/memcached-client')
  , cardBackStore = reqlib('lib/card-back-store')
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

function pngKey(jobId) {
  return 'deck-pdf-job.pngs.' + jobId;
}

function buildJobKey(jobId) {
  return 'deck-pdf-job.jobs.' + jobId;
}

function startJob(cards, logger) {
  var job = new pngBatchJob.PngBatchJob(cards, logger, svg2png, uuid, cardWidthInches)
    , jobKey = buildJobKey(job.id())
    ;

  memcached.set(jobKey, 'running', jobTtlSecs)
    .then(job.start)
    .then((pngs) => {
      var orderedPngs = cards.map((card) => {
        return pngs[card.id];
      });

      return memcached.set(pngKey(job.id()), orderedPngs, pngTtlSecs);
    })
    .then(() => {
      console.log('job key: ' + jobKey);
      return memcached.set(jobKey, 'done', jobTtlSecs)
    })
    .catch((err) => {
      logger.error({}, err);
    });

  return job.id();
}
module.exports.startJob = startJob;

function jobStatus(id) {
  return memcached.get(buildJobKey(id))
    .then((status) => {
      if (!status) {
        status = 'dead'
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

function pipePdf(id, res) {
  var doc = new PDFDocument({
        autoFirstPage: false
      })
    , cardBack = cardBackStore.get('default')
    , pngs = deckPngs.get(id)
    , pngsSlices
    ;

  return memcached.get(pngKey(id))
    .then((pngs) => {
      if (!pngs) {
        throw new Error('Results for job id ' + id + ' not found');
      } 

      pngsSlices = new Array(Math.ceil(pngs.length * 1.0 / cardsPerPage));

      for (var i = 0; i < pngsSlices.length; i++) {
        pngsSlices[i] = pngs.slice(i * cardsPerPage, 
          Math.min((i + 1) * cardsPerPage, pngs.length));
      }

      doc.pipe(res);
      
      pngsSlices.forEach((slice) => {
        makePage(slice, doc, false);
        makePage(cardBacks(cardsPerPage, cardBack), doc, true);
      });

      doc.end();
    });
}
module.exports.pipePdf = pipePdf;

