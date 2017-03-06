module.exports.supply = function(params, apiResults, choices, fieldSpec, cb) {
  var defaultVal = null;

  if (choices && choices.length > 0) {
    defaultVal = '$choiceIndex-0';
  }

  cb(null, defaultVal);
}
