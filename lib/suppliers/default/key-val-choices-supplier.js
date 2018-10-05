module.exports.supply = function(params, data, choices, tips, locale) {
  return new Promise((resolve, reject) => {
    resolve({
      choiceKey: choices.map((choice) => {
        return choice.choiceKey;   
      })
    });
  });
}
