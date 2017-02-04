(function() {
  var exports = {}

  if (typeof module === "undefined") {
    window.Trait = exports;
  } else {
    module.exports = exports;
  }

  const width  = 360,
        height = 504,
        imgHeight = 200,
        heightWidthRatio = (imgHeight * 1.0) / width;

  function getWidth() {
    return width;
  }
  exports.width = getWidth;

  function getHeight() {
    return height;
  }
  exports.height = getHeight;

  function imageFieldNames() {
    return ["mainPhoto"];
  }
  exports.imageFieldNames = imageFieldNames;

  function draw(canvas, content) {
    var ctx = canvas.getContext('2d'),
        mainPhoto = content['mainPhoto'];

    ctx.fillStyle = 'rgb(150, 56, 37)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '24px Open Sans';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(content['commonName'], 15, 25);

    ctx.font = 'italic 20px Open Sans';
    ctx.fillText(content['sciName'], 15, 50);

    ctx.drawImage(mainPhoto['image'], mainPhoto['sx'], mainPhoto['sy'], mainPhoto['sWidth'], heightWidthRatio * mainPhoto['sWidth'], 0, 65, width, imgHeight);
  }
  exports.draw = draw;
})();
