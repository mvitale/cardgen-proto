var reqlib = require('app-root-path').require;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , crypto = require('crypto')
  , fs = require('fs')
  ;

var DedupFile = require('_/models/dedup-file')
  , fileUtil = require('_/models/util/file-util')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('DedupFile', () => {
  var doc
    , minValidAppId = 'appId'
    , minValidUserId = 2
    , minValidDigest = 'asdf1234'
    , minValidData = {
        path: '/file/path/file.jpg',
        digest: minValidDigest,
        size: 42,
        mimeType: 'image/jpeg',
        userId: minValidUserId,
        appId: minValidAppId
      }
    ;
  describe('validations', () => {
    describe('valid instance', () => {
      beforeEach(() => {
        doc = new DedupFile(minValidData);
      });

      it('is valid', (done) => {
        doc.validate((err) => {
          expect(err).not.to.exist;
          done();
        });
      });
    });

    context('when the path is missing', () => {
      beforeEach(() => {
        data = Object.assign({}, minValidData);
        data.path = null;
        doc = new DedupFile(data);
      });

      it('is invalid', (done) => {
        doc.validate((err) => {
          expect(err).to.exist;
          done();
        });
      });
    });

    context('when the digest is missing', () => {
      beforeEach(() => {
        data = Object.assign({}, minValidData);
        data.digest = null;
        doc = new DedupFile(data);
      });

      it('is invalid', (done) => {
        doc.validate((err) => {
          expect(err).to.exist;
          done();
        });
      });
    });

    context('when the size is missing', () => {
      beforeEach(() => {
        data = Object.assign({}, minValidData);
        data.size = null;
        doc = new DedupFile(data);
      });

      it('is invalid', (done) => {
        doc.validate((err) => {
          expect(err).to.exist;
          done();
        });
      });
    });

    context('when the mimeType is missing', () => {
      beforeEach(() => {
        data = Object.assign({}, minValidData);
        data.mimeType = null;
        doc = new DedupFile(data);
      });

      it('is invalid', (done) => {
        doc.validate((err) => {
          expect(err).to.exist;
          done();
        });
      });
    });

    context('when the userId is missing', () => {
      beforeEach(() => {
        data = Object.assign({}, minValidData);
        data.userId = null;
        doc = new DedupFile(data);
      });

      it('is invalid', (done) => {
        doc.validate((err) => {
          expect(err).to.exist;
          done();
        });
      });
    });
  });

  describe('#findOrCreateFromBuffer', () => {
    var digest = minValidDigest
      , userId = minValidUserId
      , appId = minValidAppId
      , findOne
      , buffer
      , createDigest
      ;

    beforeEach(() => {
      findOne =
        sandbox.stub(DedupFile, 'findOne').withArgs({
          userId: userId,
          digest: digest,
          appId: appId
        });

      buffer = sandbox.stub();

      createDigest = sandbox.stub(fileUtil, 'createDigest')
        .withArgs(buffer).returns(digest);
    });

    context('when there is a document with the same digest', () => {
      var found;

      beforeEach(() => {
        found = new DedupFile(minValidData);
        findOne.yields(null, found);
      });

      it('yields it', () => {
        DedupFile.findOrCreateFromBuffer(buffer, appId, userId, '/destination',
          (err, result, created) => {
            expect(err).not.to.exist;
            expect(result).to.equal(found);
            expect(created).to.be.false;
          }
        );
      });
    });

    context("when there isn't a DedupFile with the same digest",
      () => {
        var filename = 'filename'
          , randomFilename
          , destination = '/foo/bar/'
          , fileType
          , fileTypeResult = {
              ext: 'jpg',
              mime: 'image/jpeg'
            }
          , createWriteStream
          , writeStream
          , create
          , newDoc = {}
          , bytesWritten = 12
          ;

        beforeEach(() => {
          findOne.yields(null, null);

          fileType = sandbox.stub(fileUtil, 'fileType').withArgs(buffer)
            .returns(fileTypeResult);

          writeStream = sinon.createStubInstance(fs.WriteStream);
          writeStream.on.withArgs('error').returns();
          writeStream.on.withArgs('finish').yields();
          writeStream.bytesWritten = bytesWritten;

          createWriteStream = sandbox.stub(fs, 'createWriteStream')
            .returns(writeStream);

          create = sandbox.stub(DedupFile, 'create').yields(null, newDoc);

          randomFilename = sandbox.stub(fileUtil, 'randomFilename')
            .yields(null, filename);
        });

        it('creates a new DedupFile and yields it', (done) => {
          DedupFile.findOrCreateFromBuffer(buffer, appId, userId, destination,
            (err, doc, created) => {
              expect(err).not.to.exist;
              expect(doc).to.equal(newDoc);
              expect(created).to.be.true;

              expect(writeStream.end).to.have.been.calledOnce.calledWith(buffer);
              expect(create).to.have.been.calledOnce.calledWith({
                appId: appId,
                path: '/foo/bar/filename.jpg',
                digest: digest,
                size: bytesWritten,
                mimeType: fileTypeResult.mime,
                userId: userId
              });

              done();
            }
          );
        });
      }
    );

    context('when finding the DedupFile yields an error', () => {
      var error = new Error('error in DedupFile.findOne');

      beforeEach(() => {
        findOne.yields(error);
      });

      it('yields the error', (done) => {
        DedupFile.findOrCreateFromBuffer(buffer, appId, userId, 'destination',
          (err, result, created) => {
            expect(err).to.equal(error);
            done();
          }
        );
      });
    });

    context('when randomFilename yields an error', () => {
      var randomFilename
        , error = new Error('error in randomFilename')
        ;

      beforeEach(() => {
        findOne.yields(null, null);
        randomFilename = sandbox.stub(fileUtil, 'randomFilename').yields(error);
      });

      it('yields the error', (done) => {
        DedupFile.findOrCreateFromBuffer(buffer, appId, userId, 'destination',
          (err, result, created) => {
            expect(err).to.equal(error);
            done();
          }
        );
      });
    });

    context('when fileType fails', () => {
      var filename = 'filename'
        , randomFilename
        ;

      beforeEach(() => {
        findOne.yields(null, null);

        randomFilename = sandbox.stub(fileUtil, 'randomFilename')
          .yields(null, filename);

        fileType = sandbox.stub(fileUtil, 'fileType').withArgs(buffer)
          .returns(null);
      });

      it('yields an error', (done) => {
        DedupFile.findOrCreateFromBuffer(buffer, appId, userId, 'destination',
          (err, result, created) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to
              .equal('Unable to determine file type of buffer');
            done();
          }
        );
      });
    });

    context('when there is an error writing the file', () => {
      var filename = 'filename'
        , randomFilename
        , destination = '/foo/bar/'
        , fileType
        , fileTypeResult = {
            ext: 'jpg',
            mime: 'image/jpeg'
          }
        , createWriteStream
        , writeStream
        , error = new Error('Error writing to writeStream')
        ;

      beforeEach(() => {
        findOne.yields(null, null);

        fileType = sandbox.stub(fileUtil, 'fileType').withArgs(buffer)
          .returns(fileTypeResult);

        writeStream = sinon.createStubInstance(fs.WriteStream);
        writeStream.on.withArgs('error').yields(error);

        createWriteStream = sandbox.stub(fs, 'createWriteStream')
          .returns(writeStream);

        randomFilename = sandbox.stub(fileUtil, 'randomFilename')
          .yields(null, filename);
      });

      it('yields the error', (done) => {
        DedupFile.findOrCreateFromBuffer(buffer, appId, userId, 'destination',
          (err, result, created) => {
            expect(err).to.equal(error);
            done();
          }
        );
      });
    });

    context('when there is an error creating the document', () => {
      var filename = 'filename'
        , randomFilename
        , destination = '/foo/bar/'
        , fileType
        , fileTypeResult = {
            ext: 'jpg',
            mime: 'image/jpeg'
          }
        , createWriteStream
        , writeStream
        , create
        , bytesWritten = 12
        , error = new Error('error in create')
        ;

      beforeEach(() => {
        findOne.yields(null, null);

        fileType = sandbox.stub(fileUtil, 'fileType').withArgs(buffer)
          .returns(fileTypeResult);

        writeStream = sinon.createStubInstance(fs.WriteStream);
        writeStream.on.withArgs('error').returns();
        writeStream.on.withArgs('finish').yields();
        writeStream.bytesWritten = bytesWritten;

        createWriteStream = sandbox.stub(fs, 'createWriteStream')
          .returns(writeStream);

        randomFilename = sandbox.stub(fileUtil, 'randomFilename')
          .yields(null, filename);

        create = sandbox.stub(DedupFile, 'create').yields(error);
      });

      it('yields the error', () => {
        DedupFile.findOrCreateFromBuffer(buffer, userId, 'destination',
          (err, result, created) => {
            expect(err).to.equal(error);
          }
        );
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});
