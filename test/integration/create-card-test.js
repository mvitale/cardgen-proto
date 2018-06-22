var reqlib = require('app-root-path').require;
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

  it('matches the saved card', () => {
    return cardUtil.getCard()
      .then((card) => {
        card = JSON.parse(JSON.stringify(card));
        savedCard._id = 'asdf';
        card._id = 'asdf';

        expect(card).to.eql(savedCard);
      });
  });
});

afterEach(() => {
  sandbox.restore();
});

