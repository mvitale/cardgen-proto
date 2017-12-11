// Thanks, http://nkzawa.tumblr.com/
var reqlib = require('app-root-path').require
  , config = reqlib('lib/config/config')
  , dbconnect = reqlib('lib/dbconnect')
  , mongoose = require('mongoose')
  ;

function wipeDb(cb) {
  mongoose.connection.db.listCollections().toArray((err, cols) => {
    if (err) {
      throw err;
    }

    wipeDbHelper(cols.map((col) => {
      return col.name;  
    }), cb)
  });
}

function wipeDbHelper(collectionNames, cb) {
  if (collectionNames.length === 0) {
    return cb();
  }

  var name = collectionNames.pop();
  mongoose.connection.db.dropCollection(name, (err) => {
    if (err) {
      throw err;
    }
    wipeDbHelper(collectionNames, cb);
  });
}

before((done) => {
  dbconnect.mongooseInit((err) => {
    if (err) {
      throw err;
    }

    wipeDb(done);
  });
});

after((done) => {
  mongoose.connection.close(done);
});

module.exports = () => {
  afterEach((done) => {
    wipeDb(done);
  });
}

