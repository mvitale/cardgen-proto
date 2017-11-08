var reqlib = require('app-root-path').reqlib;
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
var flatten = require('flat')
  , fs      = require('fs')
  , merge   = require('merge')
  ;

/*
 * State
 */
var flattenedConfig = null;
var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

/*
 * Constants
 */
var secretsPrefix = '$secrets.';

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
    , secretsRaw = fs.readFileSync(__dirname + '/secrets.json')
    , secrets = JSON.parse(secretsRaw)
    , flatSecrets = flatten(secrets)
    , envData = envDataRaw ? JSON.parse(envDataRaw) : null
    ;

  if (envData) {
    merge.recursive(data, envData);
  }

  flattenedConfig = resolveSecrets(
    flatten(data, {
      safe: true
    }),
    flatSecrets
  );
}
module.exports.load = load;

function resolveSecrets(flattenedConfig, flatSecrets) {
  for (var key in flattenedConfig) {
    var val = flattenedConfig[key]
      , secretsKey
      , secretsVal
      ;

    if (typeof val === "string" && val.startsWith(secretsPrefix)) {
      secretsKey = val.substring(secretsPrefix.length);
      secretsVal = flatSecrets[secretsKey];

      if (!secretsVal) {
        throw new Error(
          'Value ' +
          val +
          " found in config, but secrets doesn't have a value for key " +
          secretsKey
        );
      }

      flattenedConfig[key] = secretsVal;
    }
  }

  return flattenedConfig;
}

/*
 * Get a config value
 */
function get(key) {
  return flattenedConfig[key];
}
module.exports.get = get;
