var fs = require('fs')
  , path = require('path')
  ;

var cardBacks = {}
  , initialized = false
  ;

function init() {
  if (initialized) {
    throw new TypeError('already initialized');
  }

  var fileNames = fs.readdirSync(path.join(__dirname, 'images', 'card_backs'));

  fileNames.forEach((name) => {
    cardBacks[path.basename(name, '.png')] = fs.readFileSync(name);
  });

  initialized = true;
}
module.exports.init = init;

function get(name) {
  if (!(name in cardBacks)) {
    throw new TypeError('Invalid card back name');
  }

  return cardBacks[name];
}
module.exports.get = get;

