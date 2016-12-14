const Canvas = require('canvas');
const fs = require('fs');

const dpi = 72;

const templates = {
  'trait': 'trait'
}

function generate(options) {
  var template = require('./templates/' + templates[options['template']]),
      content = options['content'],
      canvasWidth = template.width(),
      canvasHeight = template.height(),
      canvas = new Canvas(canvasWidth, canvasHeight);

  template.draw(canvas, content);
  fs.writeFile('out.jpg', canvas.toBuffer());
}

module.exports.generate = generate;

