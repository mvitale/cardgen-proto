var reqlib = require('app-root-path').require
  , dataUtils = reqlib('lib/data-utils/data-utils')
  ;

module.exports.supply = function(params, data, locale) {
  return new Promise((resolve, reject) => {
    var results = []
      , usedKeys = {}
      ;

    data.images.forEach((image) => {
      var choiceKey = image.url;

      if (!(choiceKey in usedKeys)) {
        results.push(Object.assign({
          choiceKey: choiceKey
        }, image));
        usedKeys[choiceKey] = true;
      }
    });

    resolve({
      choices: results
    });
  });
};

