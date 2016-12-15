var Trait = {
  exports: {}
};

if (!module) {
  module = Trait;
}

(function() {
  const width  = 360,
        height = 504;

  function getWidth() {
    return width;
  }
  module.exports.width = getWidth;

  function getHeight() {
    return height;
  }
  module.exports.height = getHeight;

  function draw(canvas, content) {
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgb(150, 56, 37)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '24px OpenSans';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(content['commonName'], 15, 25);

    ctx.font = 'italic 20px OpenSans';
    ctx.fillText(content['sciName'], 15, 50);

    //ctx.drawImage(content['image'], 0, 0);
    var Canvas = require('canvas'),
        Image  = Canvas.Image;
    var img = new Image;
    img.src = canvas.toBuffer();
    ctx.drawImage(img, 0, 0, 50, 50);
    

    /*
    ctx.font = '30px Helvetica';
    ctx.fillText(content['text'], 50, 100);

    var te = ctx.measureText(content['text']);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + te.width, 102);
    ctx.stroke();
    */
  }
  module.exports.draw = draw;
})();

