var crypto = require('crypto');

function uniqueValues(obj) {
  var values = [];

  for (key in obj) {
    values = values.concat(obj[key]);
  }

return sortUniq(values);
}
module.exports.uniqueValues = uniqueValues;

function sortUniq(arr) {
  arr.sort();
  arr = arr.filter(((v, i, a) => a.indexOf(v) === i));

  return arr;
}
module.exports.sortUniq = sortUniq;

function createChoiceKey(text) {
  var hash = crypto.createHash('md5');
  hash.update(text);
  return hash.digest('hex');
}
