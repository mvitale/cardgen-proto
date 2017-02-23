module.exports.supply = function(params, apiResults, choices, cb) {
  if (choices.length > 0) {
    cb(null, { index: 0, sx: 0, sy: 0, sWidth: 500 });
  } else {
    cb(null, null);
  }
}
