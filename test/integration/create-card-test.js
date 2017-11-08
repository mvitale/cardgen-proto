var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , fs = require('fs')
  , path = require('path')
  , cardUtil = require('./util/card')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

var cardDataPath = path.join(__dirname, '/data/card.json');

describe('Create card', () => {
  var savedCard = JSON.parse(fs.readFileSync(cardDataPath, 'utf-8'));

  it('matches the saved card', (next) => {
    cardUtil.getCard((err, card) => {
      expect(err).not.to.exist;

      card = JSON.parse(JSON.stringify(card));
      savedCard._id = 'asdf';
      card._id = 'asdf';

      expect(card).to.eql(savedCard);
      next();
    });
  });
});

afterEach(() => {
  sandbox.restore();
});

