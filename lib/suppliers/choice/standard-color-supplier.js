var reqlib = require('app-root-path').require
  , standardColors = reqlib('lib/suppliers/choice/shared/standard-colors')
  ;

var choices = standardColors.choices();

module.exports.supply = function(params, data, locale, cb) {
  cb(null, choices, null);
}

