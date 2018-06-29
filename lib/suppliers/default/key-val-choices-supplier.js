module.exports.supply = function(params, data, choices, tips, locale, cb) {
  return cb(null, null, choices.map(function(choice) {
    return choice.choiceKey;
  }));
}
