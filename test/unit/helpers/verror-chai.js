var reqlib = require('app-root-path').require;
var VError = require('verror').VError;

module.exports = function(chai, utils) {
  var Assertion = chai.Assertion;

  Assertion.addMethod('verror', function(msgPrefix) {
    var obj = this._obj;

    // first, our instanceof check, shortcut
    new Assertion(obj).to.be.instanceof(VError);

    // second, our message prefix check
    this.assert(
        obj.message.startsWith(msgPrefix)
      , "expected #{act} to start with #{exp}"
      , "expected #{act} not to start with #{exp}"
      , msgPrefix     // expected
      , obj.message   // actual
    );
  });

  Assertion.addMethod('calledWithVerror', function(msgPrefix) {
    var obj = this._obj
      , expectedNumArgs = 1
      , args = obj.args[0]
      , error
      ;

    // Check arguments length
    this.assert(
        args.length === expectedNumArgs
      , "expected number of arguments to be #{exp}, but it was #{act}"
      , "expected number of arguments to not be #{exp}"
      , expectedNumArgs
      , args.length
    );

    // Check type and message prefix of first argument
    new Assertion(args[0]).to.be.verror(msgPrefix);
  });
};
