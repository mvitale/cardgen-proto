module.exports.supply = function(params, data, choices, tips, locale) {
  return new Promise((resolve, reject) => {
    var choiceKey = null;

    if (choices.length > 0) {
      choiceKey = choices[choices.length - 1].choiceKey
    }

    resolve({
      choiceKey: choiceKey
    });
  });
}

