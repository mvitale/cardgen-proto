var reqlib = require('app-root-path').require
  , mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , pathUtils = reqlib('lib/path-utils')
  , Deck = reqlib('lib/models/deck')
  , generator = reqlib('lib/generator')
  , cardBackStore = reqlib('lib/card-back-store')
  , fs = require('fs-extra')
  , path = require('path')
  , archiver = require('archiver')
  ;

var basePath = pathUtils.storagePath('deck_pngs');

var pngJobSchema = new Schema({
  appId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  deck: {
    type: Schema.Types.ObjectId,
    ref: 'Deck',
    autopopulate: true
  }
}, {
  timestamps: true
});

pngJobSchema.plugin(require('mongoose-autopopulate'));

function run(baseLogger, done) {
  var logger = baseLogger.child({ jobId: this._id })
    , dirPath = path.join(basePath, this._id.toString())
    , pngs
    , that = this
    ;

  logger.info({}, 'start png job')

  return fs.mkdir(dirPath, { recursive: true })
  .then(() => {
    return generator.generateDeckPngs(this.deck, {
      safeSpaceLines: false 
    });
  }).then((result) => {
    pngs = result;
  }).then(() => {
    var promises = new Array(pngs.length)
      ;

    for (var i = 0; i < pngs.length; i++) {
      promises[i] = fs.writeFile(
        path.join(dirPath, 'card_' + i + '.png'),
        pngs[i]
      );
    }

    return Promise.all(promises);
  })
  .then(() => {
    var writeStream = fs.createWriteStream(resultPath(this.resultFileName()))
      , archive = archiver('zip', {})
      , cardBacks = cardBackStore.allImages()
      ;

    writeStream.on('close', () => {
      logger.info({}, 'job finished')
      that.status = 'done'
      that.save();
    });

    writeStream.on('error', (err) => {
      throw err;
    });

    archive.pipe(writeStream);
    archive.directory(dirPath + '/', false);
    cardBacks.forEach((back) => {
      archive.append(back.buffer, { name: back.fileName });
    });
    archive.finalize();
  })
  .then(done)
  .catch((err) => {
    logger.error({ err: err }, 'png job failed');
    that.status = 'error';
    that.save();
    done();
  });
}
pngJobSchema.methods.run = run;

function resultPath(fileName) {
  return path.join(basePath, fileName);
}
pngJobSchema.statics.resultPath = resultPath;

function resultFileName() {
  return this.deck.name + '_' + this._id.toString() + '.zip';
}
pngJobSchema.methods.resultFileName = resultFileName;

module.exports = mongoose.model('PngJob', pngJobSchema);
