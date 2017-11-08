var reqlib = require('app-root-path').require;
var fs = require('fs');
var path = require('path');

var templateDir = 'templates'
  , jsonExt = '.json'
  , templatePath = path.join(__dirname, templateDir)
  ;

/*
 * This method performs synchronous file operations and should only be called
 * once during application initialization.
 */
function templates() {
  var fileNames = fs.readdirSync(templatePath)
    , templates = []
    ;

  fileNames.forEach((fileName) => {
    var templateName
      , filePath
      , file
      ;

    if (fileName.endsWith(jsonExt)) {
      templateName = fileName.substring(0, fileName.length - jsonExt.length);
      filePath = path.join(templatePath, fileName);
      file = fs.readFileSync(filePath);
      templates.push(JSON.parse(file));
    }
  });

  return templates;
}
module.exports.templates = templates;
