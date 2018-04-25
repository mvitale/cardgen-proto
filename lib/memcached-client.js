var Memcached = require('memcached')
  ;

var memcached = new Memcached('localhost:11211', {
  maxValue: 100 * 100 * 1000
});
  
module.exports.get = function(key) {
  return new Promise((resolve, reject) => {
    memcached.get(key, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

module.exports.set = function(key, val, ttl) {
  return new Promise((resolve, reject) => {
    memcached.set(key, val, ttl, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports.del = function(key) {
  return new Promise((resolve, reject) => {
    memcached.del(key, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
