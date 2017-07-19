var LRU = require('lru-cache');
var generator = require('_/generator');
var config = require('_/config/config');

var bytesInMb = 1000000;
var cacheMaxSize = parseInt(config.get('cardSvgCache.maxSize')) * bytesInMb;

var cache = LRU({
  max: cacheMaxSize,
  length: (n, key) => {
    return Buffer.byteLength(n) + Buffer.byteLength(key, 'utf-8');
  },
  stale: true // Evict items on set, not get.
});

module.exports.get = function(card, reqLog, cb) {
  var key = buildKey(card._id, card.version)
    , log = reqLog.child({ cacheKey: key })
    , svgBuf = cache.get(key)
    ;

  if (svgBuf) {
    log.info('SVG cache hit');
    return cb(null, svgBuf);
  } else {
    log.info('SVG cache miss');
  }

  generator.generateSvg(card, (err, buf) => {
    if (err) return cb(err);

    cache.set(key, buf);
    cb(null, buf);
  });
};

function buildKey(cardId, cardVersion) {
  return cardId + '-' + cardVersion;
}
