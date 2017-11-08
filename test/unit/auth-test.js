var reqlib = require('app-root-path').require;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;

var auth;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('auth', () => {
  beforeEach(() => {
    auth = require('_/auth');
  });

  describe('#init', () => {
    context('when the API key supplier result is null', () => {
      beforeEach(() => {
        auth.setApiKeySupplier(() => {
          return null;
        });
      });

      it('throws an error', () => {
        expect(() => {
          auth.init();
        }).to.throw(Error, 'No api keys configured');
      });
    });

    context('when the API key supplier result is empty', () => {
      beforeEach(() => {
        auth.setApiKeySupplier(() => {
          return {};
        });
      });

      it('throws an error', () => {
        expect(() => {
          auth.init();
        }).to.throw(Error, 'No api keys configured');
      });
    });

    context("when the API key supplier result isn't empty", () => {
      beforeEach(() => {
        auth.setApiKeySupplier(() => {
          return {
            foo: 'bar'
          };
        });
      });

      it("doesn't throw an error", () => {
        expect(() => {
          auth.init();
        }).not.to.throw;
      });
    });
  });

  describe('#auth', () => {
    var apiKey = 'apiKey'
      , apiKeySupplier = () => {
          return {
            'app1': apiKey,
            'otherapp': 'otherkey'
          }
        }
      ;

    beforeEach(() => {
      auth.setApiKeySupplier(apiKeySupplier);
      auth.init();
    });

    context('when the api key is valid', () => {
      it('returns the correct app name', () => {
        expect(auth.auth(apiKey)).to.equal('app1');
      });
    });

    context('when the api key is invalid', () => {
      it('returns null', () => {
        expect(auth.auth('blargh')).to.be.null;
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
