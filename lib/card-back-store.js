var fs = require('fs')
  , path = require('path')
  ;

var cardBacks = {};

function init() {
  var fileNames = fs.readdirSync(path.join(__dirname, 'images', 'card_backs'));

  fileNames.forEach((name) => {
    cardBacks[path.basename(name, '.js')] = fs.readFileSync(name);
  });
}
module.exports.init = init;

function get(name) {
  if (!(name in cardBacks)) {
    throw new TypeError('Invalid card back name');
  }

  return cardBacks[name];
}
module.exports.get = get;

