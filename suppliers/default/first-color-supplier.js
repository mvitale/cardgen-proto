module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var defaultVal = null
    , choiceIndex = null;

  if (choices && choices.length > 0) {
    choiceIndex = 0;
    defaultVal = choices[choiceIndex]
  }

  cb(null, defaultVal, choiceIndex);
}
