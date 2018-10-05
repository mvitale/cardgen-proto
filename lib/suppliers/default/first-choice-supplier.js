module.exports.supply = function(params, data, choices, tips, locale) {
  return new Promise((resolve, reject) => {
    var choiceKey = null;

    if (choices.length > 0) {
      choiceKey = choices[0].choiceKey
    }

    resolve({
      choiceKey: choiceKey
    });
  });
}

