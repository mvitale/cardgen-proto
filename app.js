var init = require('./init');

function logErrorAndDieIfExists(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
}

init((err) => {
  logErrorAndDieIfExists(err);

  var server = require('./server');
  server.start();
});
