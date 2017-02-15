var Canvas = require('canvas');

module.exports.supply = function supply(width, height) {
  return new Canvas(width, height, 'svg');
}
