var Canvas = require('canvas');

module.exports.instance = function(targetWidth) {
  return {
    supply: function(templateWidth, templateHeight) {
      var scale = targetWidth / (templateWidth * 1.0)
        , canvas = new Canvas(targetWidth, templateHeight * scale)
        , ctx = canvas.getContext('2d');

      ctx.scale(scale, scale);
      return canvas;
    }
  }
}
