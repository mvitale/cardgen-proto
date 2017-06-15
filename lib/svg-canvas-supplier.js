/*
 * Canvas supplier for use with template-renderer. Creates an svg node-canvas
 * with the specified width and height.
 */
var Canvas = require('canvas');

module.exports.drawingCanvas = function(width, height) {
  return new Canvas(width, height, 'svg');
}

module.exports.transformCanvas = function(width, height) {
  return new Canvas(width, height);
}
