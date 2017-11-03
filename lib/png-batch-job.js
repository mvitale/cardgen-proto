var generator = require('_/generator')
  , uuid = require('uuid')
  , svg2png = require('svg2png')
  ;

var cardWidth = 400; // TODO: ???

function PngBatchJob(cards, logger) {
  var cardsRemaining = cards.length
    , pngs = {}
    , id = uuid()
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

  function id() {
    return id;
  }
  this.id = id;
}
module.exports.PngBatchJob = PngBatchJob;
