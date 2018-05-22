module.exports.supply = function(params, data, choices, tips, cb) {
  return cb(null, null, choices.map(function(choice) {
    return choice.choiceKey;
  }));
}
