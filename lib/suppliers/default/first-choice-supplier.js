module.exports.supply = function(params, data, choices, tips, locale, cb) {
  var choiceKey = null;

  if (choices.length > 0) {
    choiceKey = choices[0].choiceKey
  }

  cb(null, null, choiceKey);
}

