var reqlib = require('app-root-path').reqlib;
module.exports.supply = function(params, data, choices, tips, cb) {
  var choiceKey = null;

  if (choices.length > 0) {
    choiceKey = choices[0].choiceKey
  }

  cb(null, null, choiceKey);
}
