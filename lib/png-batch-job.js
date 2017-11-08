var reqlib = require('app-root-path').require;
var generator = reqlib('lib/generator')
  ;

var ppi = 300
  , cardWidth = 2.5 * ppi // assume standard poker card, 2.5 * 3.5 inches
  ;

function PngBatchJob(cards, logger, svg2png, idFn) {
  var cardsRemaining = cards.length
    , pngs = {}
    , id = idFn()
    ;

  function start() {
    return new Promise((resolve, reject) => {
      cards.forEach((card) => {
        generator.generateSvg(card, logger, cardDone.bind(null, card.id,
          resolve, reject));
      });
    });
  }
  this.start = start;

  function cardDone(cardId, resolve, reject, err, buf) {
    if (err) {
      return reject(err);
    } else {
      svg2png(buf, { width: cardWidth })
        .then((png) => {
          pngs[cardId] = png;

          if (--cardsRemaining === 0) {
            return resolve(pngs);
          }
        })
        .catch(reject);
    }
  }

  this.id = function() {
    return id;
  }
}
module.exports.PngBatchJob = PngBatchJob;
