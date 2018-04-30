var reqlib = require('app-root-path').require
  , generator = reqlib('lib/generator')
  ;

var ppi = 300
  ;

function PngBatchJob(cards, logger, svg2png, cardWidthInches) {
  var cardsRemaining = cards.length
    , pngs = {}
    ;

  function start() {
    return new Promise((resolve, reject) => {
      cards.forEach((card) => {
        generator.generateSvgHiRes(card, logger, cardDone.bind(null, card.id,
          resolve, reject));
      });
    });
  }
  this.start = start;

  function cardDone(cardId, resolve, reject, err, buf) {
    if (err) {
      return reject(err);
    } else {
      svg2png(buf, { width: cardWidthInches * ppi })
        .then((png) => {
          pngs[cardId] = png;

          if (--cardsRemaining === 0) {
            return resolve(pngs);
          }
        })
        .catch(reject);
    }
  }
}
module.exports.PngBatchJob = PngBatchJob;
