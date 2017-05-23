var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var path = require('path');

var imageRoutes = require('_/routes/images')
  , dedupFile = require('_/models/dedup-file')
  , resUtils = require('_/routes/util/res-utils')
  , urlHelper = require('_/url-helper')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  , DedupFile = dedupFile.DedupFile
  ;

chai.use(sinonChai);

describe('images', () => {
  var req
    , res
    , jsonRes
    , errJsonRes
    ;

  beforeEach(() => {
    res = sandbox.stub();
    jsonRes = sandbox.stub(resUtils, 'jsonRes');
    errJsonRes = sandbox.stub(resUtils, 'errJsonRes');
  });

  describe('#saveImage', () => {
    var findOrCreate
      , userId = 1
      , body = { foo: 'bar' }
      ;

    beforeEach(() => {
      req = {
        params: {
          userId: userId
        },
        body: body
      }

      findOrCreate = sandbox.stub(DedupFile, 'findOrCreateFromBuffer')
        .withArgs(body, userId, path.join(__dirname, '../../..', 'storage/uploaded_images'));
    });

    context('when findOrCreateFromBuffer is successful', () => {
      var fakeFile = { file: 'yeah!' }
        , url = 'http://service/images/theimage'
        , imageUrlHelper
        ;

      beforeEach(() => {
        findOrCreate.yields(null, fakeFile);
        imageUrlHelper = sandbox.stub(urlHelper, 'imageUrl')
          .withArgs(fakeFile).returns(url);

        imageRoutes.saveImage(req, res);
      });

      it('calls jsonRes with ok status and url', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.ok,
          { url: url }
        )
      });
    });

    context('when findOrCreateFromBuffer yields an error', () => {
      var error = new Error('error in findOrCreateFromBuffer');

      beforeEach(() => {
        findOrCreate.yields(error);

        imageRoutes.saveImage(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });
  });

  describe('#getImage', () => {
    var findById
      , imageId = '1234asdf'
      ;

    beforeEach(() => {
      req = {
        params: {
          imageId: imageId
        }
      };

      findById = sandbox.stub(DedupFile, 'findById').withArgs(imageId);
    });

    context('when the image is found', () => {
      var fakeImage
        , mimeType = 'foobar'
        ;

      beforeEach(() => {
        fakeImage = sandbox.stub();
        fakeImage.read = sandbox.stub();
        fakeImage.mimeType = mimeType;

        findById.yields(null, fakeImage);
      });

      context('when image read succeeds', () => {
        var buffer;

        beforeEach(() => {
          buffer = sandbox.stub();
          fakeImage.read.yields(null, buffer);

          res.setHeader = sandbox.spy();
          res.send = sandbox.spy();

          imageRoutes.getImage(req, res);
        });

        it('sets the Content-Type header and calls res.send with the buffer', () => {
          expect(res.setHeader).to.have.been.calledWith('Content-Type', mimeType);
          expect(res.send).to.have.been.calledOnce.calledWith(buffer);
        });
      });

      context('when image read yields an error', () => {
        var error = new Error('image read failed');

        beforeEach(() => {
          fakeImage.read.yields(error);

          imageRoutes.getImage(req, res);
        });

        it('calls errJsonRes with the error', () => {
          expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
        });
      });
    });

    context('when image is not found', () => {
      beforeEach(() => {
        findById.yields(null, null);

        imageRoutes.getImage(req, res);
      });

      it('calls jsonRes with not found status and message', () => {
        expect(jsonRes).to.have.been.calledOnce.calledWith(
          res,
          resUtils.httpStatus.notFound,
          { msg: 'Image ' + imageId + ' not found' }
        );
      });
    });

    context('when image find yields an error', () => {
      var error = new Error('error finding file');

      beforeEach(() => {
        findById.yields(error);

        imageRoutes.getImage(req, res);
      });

      it('calls errJsonRes with the error', () => {
        expect(errJsonRes).to.have.been.calledOnce.calledWith(res, error);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
