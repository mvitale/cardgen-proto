var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , config = require('_/config/config')
  , mongoose = require('mongoose')
  ;

var dbconnect = require('_/dbconnect');

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('dbconnect', () => {
  describe('#mongooseInit', () => {
    context('when all of the expected config values are set', () => {
      var mongooseConnect
        , onceStub
        , onStub
        , cb
        ;

      beforeEach(() => {
        var configGet = sandbox.stub(config, 'get')
          , mongooseConnection
          ;

        cb = sandbox.spy();
        mongooseConnect = sandbox.stub(mongoose, 'connect');

        onceStub = sandbox.stub();
        onStub = sandbox.stub();
        mongooseConnection = {
          once: onceStub,
          on: onStub
        };
        mongoose.connection = mongooseConnection;

        configGet.withArgs('db.host').returns('card-db');
        configGet.withArgs('db.port').returns('1234');
        configGet.withArgs('db.dbName').returns('cardgen');
        configGet.withArgs('db.user').returns('cardgenUser');
        configGet.withArgs('db.password').returns('cardgenPass');

      });

      it('calls mongoose.connect with the expected uri and cb', () => {
        dbconnect.mongooseInit(cb);
        expect(mongooseConnect).to.have.been.calledOnce.calledWith(
          'mongodb://cardgenUser:cardgenPass@card-db:1234/cardgen',
          { useMongoClient: true },
          cb
        );
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
