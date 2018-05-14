module.exports.supply = function(params, data, choices, tips, cb) {
  var choiceKey = null;

  if (choices.length > 0) {
    choiceKey = choices[choices.length - 1].choiceKey
  }

  cb(null, null, choiceKey);
}

