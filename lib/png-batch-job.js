var reqlib = require('app-root-path').require
  , generator = reqlib('lib/generator')
  ;

function PngBatchJob(cards, logger, cardWidthInches) {
  var cardsRemaining = cards.length
    , pngs = {}
    ;

  function start() {
    return Promise.all(cards.map((card) => {
      return generator.generatePng(card, { 
        widthInches: cardWidthInches, 
        safeSpaceLines: true
      }, logger)
    }));
  }
  this.start = start;
}
module.exports.PngBatchJob = PngBatchJob;
