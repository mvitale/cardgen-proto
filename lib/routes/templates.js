var resUtils = require('_/routes/util/res-utils')
  , templateManager = require('_/template-manager')
  , TemplateWrapper = require('_/api-wrappers/template-wrapper')
  ;

module.exports.getTemplate = function(req, res) {
  var name = req.params.templateName
    , template = templateManager.getTemplate(name, req.locale)
    ;

  if (!template) {
    resUtils.jsonRes(res, resUtils.httpStatus.notFound, { msg: 'template ' + name + ' not found' });
  } else {
    resUtils.jsonRes(res, resUtils.httpStatus.ok, new TemplateWrapper(template));
  }
}
