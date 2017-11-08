var reqlib = require('app-root-path').reqlib;
var mocha = require('mocha')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , decache = require('decache')
  ;

var collectionCardCreator
  , eolApiCaller = require('_/api-callers/eol-api-caller')
  , CollectionCardsJob = require('_/collection-cards-job')
  ;

var expect = chai.expect
  , sandbox = sinon.sandbox.create()
  ;

chai.use(sinonChai);

describe('collectionCardCreator', () => {
  var appId = 'app'
    , userId = 1234
    , locale = 'en'
    , deck = 'deck'
    , colId = 871246
    , getJson
    , log = sinon.stub()
    , newJob
    , startStub
    , job
    , jobId = 'cards-job-id'
    , id1 = 7474
    , id2 = 8475
    , collectionItems = [
        {
          object_id: id1
        },
        {
          object_id: id2
        }
      ]
    ;

  beforeEach(() => {
    collectionCardCreator = require('_/collection-card-creator');
    getJson = sandbox.stub(eolApiCaller, 'getJson');
    newJob = sandbox.stub(CollectionCardsJob, 'new');
    startStub = sandbox.stub();
    startStub.returns({
      then: sandbox.stub()
    });
    statusStub = sandbox.stub();
    job = {
      start: startStub,
      id: jobId,
      status: statusStub
    };
    newJob.returns(job);
    getJson.yields(null, {
      collection_items: collectionItems
    });
  });

  describe('#createJob', () => {
    context('when eolApiCaller returns a collections result', () => {


      it('creates a CollectionCardsJob and starts it', () => {
        return collectionCardCreator.createJob(appId, userId, locale, deck,
          colId, log)
          .then((actualJobId) => {
            expect(actualJobId).to.equal(jobId);
            expect(getJson).to.have.been.calledOnce.calledWith(
              'collections',
              {
                id: colId,
                per_page: 50,
                page: 1,
                filter: 'taxa',
                sort_by: 'recently_added',
                language: 'en'
              }
            );
            expect(newJob).to.have.been.calledOnce.calledWith(appId,
              userId, locale, deck, [id1, id2]);
            expect(startStub).to.have.been.calledOnce;
          });
      });
    });

    context('when eolApiCaller yields an error', () => {
      var err = new Error('api call failed');
      beforeEach(() => {
        getJson.yields(err);
      });

      it('rejects with the error', () => {
        return collectionCardCreator.createJob(appId, userId, locale, deck,
          colId, log)
          .catch((actualErr) => {
            expect(actualErr).to.equal(err);
          });
      });
    });

    context('when eolApiCaller result is missing collection_items', () => {
      var apiResult = {
        foo: 'bar'
      };

      beforeEach(() => {
        getJson.yields(null, apiResult);
      });

      it('rejects with an error', () => {
        return collectionCardCreator.createJob(appId, userId, locale, deck,
          colId, log)
          .catch((err) => {
            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.equal(
              'collection_items missing from collections result');
          });
      })
    });
  });

  describe('#jobStatus', () => {
    context('when the job status is pending', () => {
      beforeEach(() => {
        statusStub.returns('pending');
      });

      it('returns pending', () => {
        return collectionCardCreator.createJob(appId, userId, locale, deck,
          colId, log)
            .then((jobId) => {
              expect(collectionCardCreator.jobStatus(jobId)).to.equal('pending');
            });
      });
    });

    context('when job status is done', () => {
      beforeEach(() => {
        statusStub.returns('done');
      });

      it('returns done', () => {
        return collectionCardCreator.createJob(appId, userId, locale, deck,
          colId, log)
            .then((jobId) => {
              expect(collectionCardCreator.jobStatus(jobId)).to.equal('done');
            });
      });
    });

    context('when the job isn\'t in the cache', () => {
      it('returns "unknown"', () => {
        expect(collectionCardCreator.jobStatus('foo')).to.equal('unknown');
      });
    });
  });

  afterEach(() => {
    decache('_/collection-card-creator');
    sandbox.restore();
  });
});
