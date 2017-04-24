var LRU = require('lru-cache');
var generator = require('./generator');
var cacheMaxSize = 5000000; // TODO: move to config. Max size of cache in bytes.

var cache = LRU({
  max: cacheMaxSize,
  length: (n, key) => {
    return Buffer.byteLength(n) + Buffer.byteLength(key, 'utf-8');
  },
  stale: true // Evict items on set, not get.
});

module.exports.get = function(card, cb) {
  var key = buildKey(card._id, card.version)
    , svgBuf = cache.get(key)
    ;

  if (svgBuf) return cb(null, svgBuf);

  generator.generateSvg(card, (err, buf) => {
    if (err) return cb(err);

    cache.set(key, buf);
    cb(null, buf);
  });
};

function buildKey(cardId, cardVersion) {
  return cardId + '-' + cardVersion;
}
