/* Database connection utility. All database connection operations should be via
 * this module.
 */
var mongoose = require('mongoose');
var mongoPort = 27017; // TODO: get from config

/*
 * Open db connection for Mongoose. This must be called before interacting
 * with the model storage layer. Only call once.
 *
 * Parameters:
 *  cb - function(err), called when connection is open or there is a
 *       connection error.
 */
function mongooseInit(cb) {
  openCardsConn(cb);
}
module.exports.mongooseInit = mongooseInit;

function openCardsConn(callback) {
  openConn('cards', callback);
}

function openConn(dbName, callback) {
  var db = null;

  mongoose.connect('mongodb://localhost:' + mongoPort + '/' + dbName);
  db = mongoose.connection;

  db.on('error', function(err) {
    return callback(err);
  });

  db.once('open', function() {
    return callback(null);
  });
}
