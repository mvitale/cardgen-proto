var reqlib = require('app-root-path').require;
/*
 * Helper functions for generating URLs
 */
var config = require('_/config/config');

/*
 * TODO: Revisit. Right now, we provide public URLs that use http on port
 * 80, and use nginx to reverse proxy those requests to the service.
 */
var port =
      config.get('server.staticResourceProxyPort') ||
      config.get('server.port')
  , baseUrl = 'http://' + config.get('server.host') + ':' + port
  ;

/*
 * Url for a DedupFile representing an uploaded image
 *
 * Parameters:
 *   dedupFile - a DedupFile
 *
 * Returns:
 *   The url for the file referenced by dedupFile
 */
function imageUrl(dedupFile) {
  return baseUrl + '/images/' + dedupFile.id;
}
exports.imageUrl = imageUrl;

/*
 * Url for a file stored in public/images
 *
 * Parameters:
 *   fileName - file name including extension
 *
 * Returns:
 *   Url for the file with name fileName
 */
function staticImageUrl(fileName) {
  return baseUrl + '/static/images/' + fileName;
}
exports.staticImageUrl = staticImageUrl;
