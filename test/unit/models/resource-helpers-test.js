var reqlib = require('app-root-path').require
  , mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , db = reqlib('test/util/db')
  , resourceHelpers = reqlib('lib/models/resource-helpers')
  , Card = reqlib('lib/models/card')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('resource-helpers', () => {
  db();

  it('creates a test card!', () => { 
    Card.create({
      userId: 1,
      appId: 'edtest',
      locale: 'en',
      templateName: 'trait',
      templateVersion: '1.0'
    });
  });
});

