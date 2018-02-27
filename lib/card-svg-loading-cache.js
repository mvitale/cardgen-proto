var reqlib = require('app-root-path').require;
var LRU = require('lru-cache');
var generator = reqlib('lib/generator');
var config = reqlib('lib/config/config');

var bytesInMb = 1000000;
var cacheMaxSize = parseInt(config.get('cardSvgCache.maxSize')) * bytesInMb;

var cache = LRU({
  max: cacheMaxSize,
  length: (n, key) => {
    return Buffer.byteLength(n) + Buffer.byteLength(key, 'utf-8');
  },
  stale: true // Evict items on set, not get.
});

function get(card, quality, reqLog, cb) {
  var key = buildKey(card._id, card.version, quality)
    , log = reqLog.child({ cacheKey: key })
    , svgBuf = cache.get(key)
    , generateFn = quality === 'hi' ? 'generateSvgHiRes' : 'generateSvgLoRes'
    ;

  if (svgBuf) {
    log.info('SVG cache hit');
    return cb(null, svgBuf);
  } else {
    log.info('SVG cache miss');
  }

  generator[generateFn].call(generator, card, log, (err, buf) => {
    if (err) return cb(err);

    cache.set(key, buf);
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
