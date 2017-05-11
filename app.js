var init = require('./init');

function logErrorAndDieIfExists(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
}

init((err) => {
  logErrorAndDieIfExists(err);

  var server = require('./server')
    , config = require('_/config/config')
    , port = config.get('server.port')
    ;

  server.listen(port, function() {
    console.log('server listening at port %s', port);
  });
});
