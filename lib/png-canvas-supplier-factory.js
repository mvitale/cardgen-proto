var Canvas = require('canvas');

module.exports.instance = function(targetWidth) {
  return {
    drawingCanvas: function(templateWidth, templateHeight) {
      return new Canvas(templateWidth, templateHeight);
      /*
       
      var scale = targetWidth / (templateWidth * 1.0)
        , canvas = new Canvas(targetWidth, templateHeight * scale)
        , ctx = canvas.getContext('2d');

      ctx.scale(scale, scale);
      return canvas;
      */
    },
    transformCanvas: function(width, height) {
      return new Canvas(width, height);
    }
  }
}
