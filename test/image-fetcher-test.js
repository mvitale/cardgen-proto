var reqlib = require('app-root-path').require;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  ;

var imageFetcher = require('_/image-fetcher')
  , FetchedImage = require('_/models/fetched-image')
  , canvas = require('canvas')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('imageFetcher', () => {
  describe('#fetch', () => {
    var findOrCreate
      , cb
      , url = 'http://www.eol.org/images/1234.jpg'
      , fetchedImage
      ;

    beforeEach(() => {
      findOrCreate = sandbox.stub(FetchedImage, 'findOrCreate');
      cb = sandbox.spy();
      fetchedImage = {
        read: sandbox.stub()
      };
    });

    context('success pathway', () => {
      var rawImage = 'imabuffer'
        , image
        ;

      beforeEach(() => {
        fetchedImage.read.yields(null, rawImage);
        findOrCreate.yields(null, fetchedImage);
        image = {
          src: null
        };
        sandbox.stub(canvas, 'Image').returns(image);

        imageFetcher.fetch(url, cb);
      });

      it('yields the expected result', () => {
        expect(findOrCreate).to.have.been.calledOnce.calledWith(
          url,
          imageFetcher.storageDir
        );
        expect(cb).to.have.been.calledOnce.calledWith(null, image);
        expect(image.src).to.equal(rawImage);
      });
    });

    context('when findOrCreate fails', () => {
      var err = new Error('findOrCreate failed');

      beforeEach(() => {
        findOrCreate.yields(err);

        imageFetcher.fetch(url, cb);
      });

      it('yields the error', () => {
        expect(cb).to.have.been.calledOnce.calledWith(err);
      });
    });

    context('when fetchedImage.read fails', () => {
      var err = new Error('fetchedImage.read failed');

      beforeEach(() => {
        fetchedImage.read.yields(err);
        findOrCreate.yields(null, fetchedImage);

        imageFetcher.fetch(url, cb);
      });

      it('yields the error', () => {
        expect(cb).to.have.been.calledOnce.calledWith(err);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
