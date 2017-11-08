var reqlib = require('app-root-path').reqlib;
var fs = require('fs')
  , path = require('path')
  , appRoot = require('app-root-path')
  ;

var cardBacks = {}
  , initialized = false
  ;

function init() {
  var backsPath = path.join(appRoot.toString(), 'lib', 'images', 'card_backs');
  if (initialized) {
    throw new TypeError('already initialized');
  }

  var fileNames = fs.readdirSync(backsPath);

  fileNames.forEach((name) => {
    cardBacks[path.basename(name, '.png')] = fs.readFileSync(path.join(backsPath, name));
  });

  initialized = true;
}
module.exports.init = init;

function get(name) {
  if (!initialized) {
    throw new TypeError('Not initialized - you must call init before this method'); 
  }

  if (!(name in cardBacks)) {
    throw new TypeError('Invalid card back name');
  }

  return cardBacks[name];
}
module.exports.get = get;

