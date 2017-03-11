module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    "http://localhost:8080/static/images/habitat_icons/freshwater.png",
    "http://localhost:8080/static/images/habitat_icons/marine.png",
    "http://localhost:8080/static/images/habitat_icons/terrestrial.png"
  ]);
}
