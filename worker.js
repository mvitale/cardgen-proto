var reqlib = require('app-root-path').require
  , config = reqlib('lib/config/config')
  , mongoose = require('mongoose')
  ;

mongoose.Promise = Promise;
config.load();

var templateManager = reqlib('lib/template-manager')
  , dbconnect = reqlib('lib/dbconnect')
  , textRenderer = reqlib('lib/opentype-text-renderer')
  , cardBackStore = reqlib('lib/card-back-store')
  , i18n = reqlib('lib/i18n')
  ;

i18n.init();
textRenderer.loadFonts();
cardBackStore.init();
templateManager.load()

dbconnect.mongooseInit()
.then(() => {
  reqlib('lib/agenda');
})
.catch((err) => {
  console.log(err);
  process.exit(1);
});

