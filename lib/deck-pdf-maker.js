var pngBatchJob = require('_/png-batch-job')
  , LRU = require('lru-cache')
  , svg2png = require('svg2png')
  , uuid = require('uuid')
  ;

var jobs = {}
  , deckPngs = LRU({ // Good enough for now. Tune as needed.
      max: 1000,
      length: (n, key) => {
        return Object.keys(n).length
      }
    })
  ;

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

function init() {
  cardBacks[defaultCardBack] = cardBack;
}
module.exports.init = init;

function startJob(cards, logger) {
  var job = new pngBatchJob.PngBatchJob(cards, logger, svg2png, uuid);
  jobs[job.id()] = job;
  job.start()
    .then((pngs) => {
      var orderedPngs = cards.map((card) => {
        return pngs[card.id];
      });
      deckPngs.set(job.id(), orderedPngs);
      delete jobs[job.id()];
    })
    .catch((err) => {
      logger.error(err);
      delete jobs[job.id()];
    });

  return job.id();
}
module.exports.startJob = startJob;

function jobStatus(id) {
  var status;

  if (id in jobs) {
    status = 'running';
  } else if (deckPngs.has(id)) {
    status = 'done';
  } else {
    status = 'dead';
  }

  return status;
}
module.exports.jobStatus = jobStatus;

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

function makePage(cards, doc) {
  var location;

  doc.addPage({
    layout: 'landscape' 
  });

  cards.forEach((card, i) => {
    location = cardLocation(i);
    doc.image(card, location.x, location.y, { width: cardWidth });
  });
}

function cardBacks(n, cardBack) {
  var result = new Array(n);
  result.fill(cardBack);
  return result;
}

function pipePdf(id, res, pdfClass, cardBack) {
  var doc = new pdfClass({
        autoFirstPage: false
      })
    , pngs = deckPngs.get(id)
    , pngsSlices
    ;

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
    makePage(slice, doc);
    makePage(cardBacks(slice.length, cardBack), doc);
  });

  doc.end();
}
module.exports.pipePdf = pipePdf;

