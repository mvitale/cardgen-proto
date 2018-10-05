var appRoot = require('app-root-path')
  , path = require('path')
  ;

function storagePath(dir) {
  return pathHelper('storage', dir);
}
module.exports.storagePath = storagePath;

function pathHelper(d1, d2) {
  return path.join(appRoot.toString(), d1, d2);
}

