var reqlib = require('app-root-path').require;
var resUtils = reqlib('lib/routes/util/res-utils')
  , templateManager = reqlib('lib/template-manager')
  , TemplateWrapper = reqlib('lib/api-wrappers/template-wrapper')
  ;

module.exports.getTemplate = function(req, res) {
  var name = req.params.templateName
    , version = req.params.templateVersion
    , template = templateManager.getTemplate(name, version, req.locale)
    ;

  if (!template) {
    resUtils.jsonRes(res, resUtils.httpStatus.notFound, { msg: 'template ' + name + ' at version ' + version + ' not found' });
  } else {
    resUtils.jsonRes(res, resUtils.httpStatus.ok, new TemplateWrapper(template));
  }
}
