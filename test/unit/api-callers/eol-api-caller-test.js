var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var request = require('request');

var expect = chai.expect;
chai.use(sinonChai);

var sandbox = sinon.sandbox.create();

describe('eol-api-caller', () => {
  var eolApiCaller = require('_/api-callers/eol-api-caller');

  var result = { its: 'some json' }
    , jsonResult = JSON.stringify(result)
    ;

  describe('#getJson', () => {
    var params = { foo: 'bar' }
      , apiName = 'baz'
      , requestGet
      , cb
      ;

    beforeEach(() => {
      cb = sinon.spy();
      requestGet = sandbox.stub(request, 'get');
    })

    describe('when request is successful', () => {
      beforeEach(() => {
        requestGet.callsFake((opts, cb) => {
          return cb(null, jsonResult, jsonResult);
        });

        eolApiCaller.getJson(apiName, params, cb);
      });

      it('passes the correct parameters to request', () => {
        expect(requestGet).to.have.been.calledWith({
          url: 'http://eol.org/api/baz/1.0.json',
          qs: params
        });
      });

      it('yields the correct result', () => {
        expect(cb).to.have.been.calledWith(null, result);
      });
    });

    describe('when request fails', () => {
      var error = new Error('Request failed');

      beforeEach(() => {
        requestGet.callsFake((opts, cb) => {
          return cb(error);
        });

        eolApiCaller.getJson(apiName, params, cb);
      });

      it('yields the error it was passed', () => {
        expect(cb).to.have.been.calledWith(error);
      });
    });

    afterEach(() => {
      sandbox.restore();
    });
  });
});
