/*
 * Get config values from config.json. Refer to nested values by a dot-separated
 * query string, e.g., for the object
 *
 * { a: { b: 3 } }
 *
 * refer to a.b with 'a.b'.
 */

/*
 * Imports
 */
var flatten = require('flat');
var fs      = require('fs');

/*
 * State
 */
var flattenedConfig = null;

/*
 * Load from config.json. Only call once.
 *
 * Parameters:
 *   cb - function(err)
 */
function load(cb) {
  if (flattenedConfig) {
    return cb(new Error('Already loaded'));
  }

  fs.readFile(__dirname + '/config.json', (err, data) => {
    if (err) return cb(err);

    var parsed = null;

    try {
      parsed = JSON.parse(data);
    } catch (e) {
      return cb(e);
    }

    flattenedConfig = flatten(parsed);

    cb();
  });
}
module.exports.load = load;

/*
 * Get a config value
 */
function get(key) {
  return flattenedConfig[key];
}
module.exports.get = get;
