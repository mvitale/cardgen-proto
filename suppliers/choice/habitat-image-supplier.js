module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    { url: "http://localhost:8080/static/images/habitat_icons/freshwater.png" },
    { url: "http://localhost:8080/static/images/habitat_icons/marine.png" },
    { url: "http://localhost:8080/static/images/habitat_icons/terrestrial.png" }
  ]);
}
