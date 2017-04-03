var request = require('request');
var sizeOfImage = require('image-size');

module.exports.supply = function(params, apiResults, choices, cb) {
  var choiceIndex = null;

  if (choices.length > 0) {
    choiceIndex = 0;
  }

  cb(null, null, choiceIndex);
}
