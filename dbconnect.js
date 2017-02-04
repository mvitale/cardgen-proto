// Database connection utility. All database connection access should be via
// this module.

var MongoClient = require('mongodb').MongoClient;
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
    MongoClient.connect('mongodb://localhost:' + mongoPort + '/' + dbName, function (err, db) {
      if (err) return callback(err, null);

      conns[dbName] = db;
      return callback(null, db);
    });
  }
}

module.exports.getConn = getConn;
