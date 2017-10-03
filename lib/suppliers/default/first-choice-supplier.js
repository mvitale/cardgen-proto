var request = require('request');
var sizeOfImage = require('image-size');

module.exports.supply = function(params, apiResults, choices, tips, cb) {
  var choiceKey = null;

  if (choices.length > 0) {
    choiceKey = choices[0].choiceKey
  }

  cb(null, null, choiceKey);
}
