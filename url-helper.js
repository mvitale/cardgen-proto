var baseUrl = "http://localhost:8080"

function imageUrl(dedupFile) {
  return baseUrl + '/images/' + dedupFile.id; // TODO: make host/port part of config
}
exports.imageUrl = imageUrl;

function staticImageUrl(fileName) {
  return baseUrl + '/static/images/' + fileName;
}
exports.staticImageUrl = staticImageUrl;
