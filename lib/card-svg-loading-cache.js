var reqlib = require('app-root-path').require;
var generator = reqlib('lib/generator');
var config = reqlib('lib/config/config');

function get(card, quality, reqLog, cb) {
  var generateFn = quality === 'hi' ? 'generateSvgHiRes' : 'generateSvgLoRes'
    ;

  generator[generateFn].call(generator, card, {}, reqLog, (err, buf) => {
    if (err) return cb(err);
    cb(null, buf);
  });
};

function buildKey(cardId, cardVersion, quality) {
  return cardId + '-' + cardVersion + '-' + quality;
}

module.exports.getHiRes = function(card, reqLog, cb) {
  get(card, 'hi', reqLog, cb);
}

module.exports.getLoRes = function(card, reqLog, cb) {
  get(card, 'lo', reqLog, cb);
}
