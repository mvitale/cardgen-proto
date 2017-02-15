var fs = require('fs');

module.exports.read = function(templateName, cb) {
  fs.readFile('./templates/' + templateName + '.json', (err, data) => {
    if (err) return cb(err);

    cb(null, JSON.parse(data));
  })
}
