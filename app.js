var init = require('_/init');

function logErrorAndDieIfExists(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
}

init((err) => {
  logErrorAndDieIfExists(err);

  var server = require('_/server')
    , config = require('_/config/config')
    , port = config.get('server.port')
    ;

  server.listen(port, function() {
    var port = server.address().port;
    console.log('server listening at port %s', port);
  });
});
