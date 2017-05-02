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
 */
function load() {
  if (flattenedConfig) {
    throw new Error('Already loaded');
  }

  var data = fs.readFileSync(__dirname + '/config.json')
    , parsed = JSON.parse(data)
    ;

  flattenedConfig = flatten(parsed);
}
module.exports.load = load;

/*
 * Get a config value
 */
function get(key) {
  return flattenedConfig[key];
}
module.exports.get = get;
