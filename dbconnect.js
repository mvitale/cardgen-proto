// Database connection utility. All database connection access should be via
// this module.
var mongoose = require('mongoose');
var mongoPort = 27017;

var conns = {};

function getCardsConn(callback) {
  return getConn('cardtest', callback);
}
module.exports.getCardsConn = getCardsConn;

// Get a connection to database dbName
function getConn(dbName, callback) {
  if (conns[dbName]) {
    return callback(null, conns[dbName]);
  } else {
    mongoose.connect('mongodb://localhost:' + mongoPort + '/' + dbName);

    var db = mongoose.connection;
    db.on('error', function(err) {
      return callback(err, null);
    });
    db.once('open', function() {
      conns[dbName] = db;
      return callback(null, db);
    });
  }
}

module.exports.getConn = getConn;
