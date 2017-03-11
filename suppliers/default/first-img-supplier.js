var request = require('request');
var sizeOfImage = require('image-size');

module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var choiceIndex = null;

  if (choices.length > 0) {
    choiceIndex = 0;
    var uri = choices[choiceIndex];

    cb(null, { url: uri }, choiceIndex);
  } else {
    cb(null, null);
  }
}
