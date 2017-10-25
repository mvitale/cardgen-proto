var generator = require('_/generator')
  , uuid = require('uuid')
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
        generator.generatePng(card, cardWidth, logger, cardDone.bind(null, card.id,
          resolve, reject));
      });
    });
  }
  this.start = start;

  function cardDone(cardId, resolve, reject, err, png) {
    if (err) {
      return reject(err);
    } else {
      pngs[cardId] = png;

      if (--cardsRemaining === 0) {
        return resolve(pngs);
      }
    }
  }

  function id() {
    return id;
  }
  this.id = id;
}
module.exports.PngBatchJob = PngBatchJob;
