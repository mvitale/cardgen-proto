/*
 * Canvas supplier for use with template-renderer. Creates a standard png
 * node-canvas with the specified width and height.
 */
var Canvas = require('canvas');

module.exports.supply = function supply(width, height) {
  return new Canvas(width, height);
}
