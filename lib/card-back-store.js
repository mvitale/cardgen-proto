var reqlib = require('app-root-path').require
  , fs = require('fs')
  , path = require('path')
  , appRoot = require('app-root-path')
  , urlHelper = reqlib('lib/url-helper')
  , i18n = reqlib('lib/i18n')
  ;

var cardBacks = {
      color: {
        i18nKey: 'color',
        fileName: 'color.png'
      },
      bw: {
        i18nKey: 'bw',
        fileName: 'bw.png'
      }
    }
  , images = {}
  , initialized = false
  ;

function init() {
  if (initialized) {
    throw new TypeError('already initialized');
  }

  var backsPath = path.join(appRoot.toString(), 'public', 'images', 'card_backs')
    ;

  for (var key in cardBacks) {
    var fileName = cardBacks[key].fileName;
    images[key] = fs.readFileSync(path.join(backsPath, fileName));
  }

  initialized = true;
}
module.exports.init = init;

function checkInitialized() {
  if (!initialized) {
    throw new TypeError('Not initialized - you must call init before this method'); 
  }
}

function get(key) {
  checkInitialized();

  if (!(key in images)) {
    throw new TypeError('Invalid card back name');
  }

  return images[key];
}
module.exports.get = get;

function list(locale) {
  checkInitialized();

  return Object.keys(cardBacks).map((key) => {
    var cardBack = cardBacks[key];

    return {
      name: i18n.t(locale, 'cardBacks.' + cardBack.i18nKey),
      imgUrl: urlHelper.staticImageUrl('card_backs/' + cardBack.fileName),
      key: key 
    }
  });
}
module.exports.list = list;

