/*
 * Load and get config values. Refer to nested values by a dot-separated query
 * string, e.g., for the object
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
var merge   = require('merge');

/*
 * State
 */
var flattenedConfig = null;
var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

console.log('NODE_ENV', env);

/*
 * Load by merging environment config into defaults. Should only be called once.
 */
function load() {
  if (flattenedConfig) {
    throw new Error('Already loaded');
  }

  var dataRaw = fs.readFileSync(__dirname + '/defaults.json')
    , data = JSON.parse(dataRaw)
    , envDataPath = __dirname + '/' + env + '.json'
    , envDataRaw = fs.existsSync(envDataPath) ? fs.readFileSync(envDataPath) : null
    , envData = envDataRaw ? JSON.parse(envDataRaw) : null
    ;

  if (envData) {
    merge.recursive(data, envData);
  }

  flattenedConfig = flatten(data);
}
module.exports.load = load;

/*
 * Get a config value
 */
function get(key) {
  return flattenedConfig[key];
}
module.exports.get = get;
