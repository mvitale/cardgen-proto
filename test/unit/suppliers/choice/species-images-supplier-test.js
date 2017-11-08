var reqlib = require('app-root-path').require;
var mocha = require('mocha');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var verrorChai = require('../../helpers/verror-chai');

var expect = chai.expect;
chai.use(sinonChai);
chai.use(verrorChai);

var speciesImagesSupplier =
  require('_/suppliers/choice/species-images-supplier');


var sandbox = sinon.sandbox.create();

describe('species-images-supplier', () => {
  describe('#supply', () => {
    var cb
      , locale = 'es'
      ;

    beforeEach(() => {
      cb = sinon.spy();
    });

    context('when data.images is present', () => {
      var url1 = 'http://www.foo.bar/image.jpg'
        , url2 = 'http://www.baz.boz/image.jpg'
        ;

      it('yields deduplicated results', () => {
        speciesImagesSupplier.supply({}, {
          images: [{
            url: url1,
          }, {
            url: url2,
          }, {
            url: url1
          }]
        }, locale, cb);
        expect(cb).to.have.been.calledOnce.calledWith(null, [{
          url: url1,
          choiceKey: url1
        }, {
          url: url2,
          choiceKey: url2
        }]);
      });
    });

    context('when data.images is empty', () => {
      beforeEach(() => {
        speciesImagesSupplier.supply({}, {images: []}, locale, cb);
      });

      it('returns an empty result', () => {
        expect(cb).to.have.been.calledWith(null, []);
      });
    });

    context('when data.images is undefined', () => {
      it('throws TypeError', () => {
        expect(() => {
          speciesImagesSupplier.supply({}, {}, locale, cb)
        }).to.throw(TypeError);
      });
    })
  });

  afterEach(() => {
    sandbox.restore();
  });
});
