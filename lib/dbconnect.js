var reqlib = require('app-root-path').require;
/* Database connection utility. All database connection operations should be via
 * this module.
 */
var mongoose = require('mongoose');

var config   = reqlib('lib/config/config');



/*
 * Open db connection for Mongoose. This must be called before interacting
 * with the model storage layer. Only call once.
 *
 * Parameters:
 *  cb - function(err), called when connection is open or there is a
 *       connection error.
 */
function mongooseInit() {
  return openConn();
}
module.exports.mongooseInit = mongooseInit;

function openConn(cb) {
  var dbHost = config.get('db.host')
    , dbPort = config.get('db.port')
    , dbName = config.get('db.dbName')
    , dbUser = config.get('db.user')
    , dbPass = config.get('db.password')
    ;

  return mongoose.connect(connString(), { useMongoClient: true });
}

function connString() {
  var dbHost = config.get('db.host')
    , dbPort = config.get('db.port')
    , dbName = config.get('db.dbName')
    , dbUser = config.get('db.user')
    , dbPass = config.get('db.password')
    ;

  return 'mongodb://' +
    dbUser +
    ':' +
    dbPass +
    '@' +
    dbHost +
    ':' +
    dbPort +
    '/' +
    dbName;
}
module.exports.connString = connString;

