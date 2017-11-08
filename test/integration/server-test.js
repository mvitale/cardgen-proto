var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha');
var sinon = require('sinon');
var chai = require('chai');
var chaiHttp = require('chai-http');

var expect = chai.expect;

chai.use(chaiHttp);

var sandbox = sinon.sandbox.create();

describe('server', () => {
  var server;

  beforeEach(() => {
    server = require('_/server');
  });

  /*
  describe('GET /templates/:templateName', () => {
    var templateManager = require('_/template-manager')
      , getTemplateStub
      , spec
      ;

    beforeEach(() => {
      getTemplateStub = sandbox.stub(templateManager, 'getTemplate');
      spec = { foo: 'bar' };

      getTemplateStub.returns(null);

      getTemplateStub.withArgs('valid_template_name').returns({
        name: 'theTemplate',
        spec: spec
      });
    });

    context('when templateName is valid', () => {
      beforeEach(() => {

      });

      it("returns that template's spec field as JSON", (done) => {
        request(server)
          .get('/templates/valid_template_name')
          .expect('Content-Type', /json/)
          .expect(200, done);
      });
    });

    context('when templateName is invalid', (done) => {
      it('responds with 404', () => {
        request(server)
          .get('/templates/invalid_template_name')
          .expect(404, done);
      });
    });
  });

  describe('POST /users/:userId/cards', () => {
    var card = require('_/models/card')
      , params = {
          templateName: 'trait',
          templateParams: { speciesId: 1234 }
        }
      , userId = 1
      , expectedCardData = Object.assign({ userId: 1}, params)
      , extraCardData = {

        }
      ;

    beforeEach(() => {
      var popStub =
        sandbox.stub(card.Card.prototype, 'populateDefaultsAndChoices');

      popStub.callsFake((cb) => {
        cb();
      });
    });

    context('when the parameters are valid', () => {
      it('creates the Card and responds with it', (done) => {
        chai.request(server)
          .post('/users/1/cards')
          .send({
            templateName: 'trait',
            templateParams: { speciesId: 1234 }
          })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(201);
            done();
          });
      });
    });
  });
  */

  afterEach(() => {
    sandbox.restore();
  });
});
