/*
 * Helper functions for generating URLs for resources
 */

var baseUrl = "http://localhost:8080" // TODO: get from config

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
  return baseUrl + '/images/' + dedupFile.id; // TODO: make host/port part of config
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
