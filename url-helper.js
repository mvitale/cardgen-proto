function imageUrl(dedupFile) {
  return "http://localhost:8080/images/" + dedupFile.id; // TODO: make host/port part of config
}
exports.imageUrl = imageUrl;
