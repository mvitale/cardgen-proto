var request = require('request');
var sizeOfImage = require('image-size');

module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {

  if (choices.length > 0) {
    var uri = choices[0];

    request({uri: uri, encoding: null}, (err, res, body) => {
      if (err) return cb(err);

      var imgSz = sizeOfImage(body)
        , targetRatio = (fieldSpec.width * (1.0)) / fieldSpec.height
        , imgRatio = (imgSz.width * (1.0)) / imgSz.height
        , sWidth = 0
        , sHeight = 0
        , sx = 0
        , sy = 0
        , gap = 0;

      // Pick smallest zoom/position to fill image field and center image
      if (imgRatio <= targetRatio) {
        sWidth = imgSz.width;
        sHeight = targetRatio / sWidth;

        gap = fieldSpec.height - sHeight;
        sy = gap / 2;
      } else {
        sHeight = imgSz.height;
        sWidth = targetRatio * sHeight;

        gap = imgSz.width - sWidth;
        sx = gap / 2;
      }

      cb(null, {url: '$choiceIndex-0', sx: sx, sy: sy, sWidth: sWidth});
    });
  } else {
    cb(null, null);
  }
}
