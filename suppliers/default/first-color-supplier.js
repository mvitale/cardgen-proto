module.exports.supply = function(params, apiResults, choices, cb) {
  var index = null;

  if (choices && choices.length > 0) {
    index = 0;
  }

  cb(null, index);
}
