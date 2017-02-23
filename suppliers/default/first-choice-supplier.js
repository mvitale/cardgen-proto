module.exports.supply = function(params, apiResults, choices, cb) {
  if (choices.length > 0) {
    cb(null, 0);
  } else {
    cb(null, null);
  }
}
