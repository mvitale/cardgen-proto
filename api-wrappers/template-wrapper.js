function TemplateWrapper(template) {
  this.delegate = template;

  this.toJSON = function() {
    return this.delegate.spec;
  }
}

module.exports = TemplateWrapper;
