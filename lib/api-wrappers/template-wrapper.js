var reqlib = require('app-root-path').require;
function TemplateWrapper(template) {
  this.delegate = template;

  this.toJSON = function() {
    return {
      spec: this.delegate.spec,
      choices: this.delegate.choices,
      choiceTips: this.delegate.choiceTips
    };
  }
}

module.exports = TemplateWrapper;
