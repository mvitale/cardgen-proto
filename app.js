var reqlib = require('app-root-path').reqlib;
var init = require('_/init')
  , https = require('https')
  , fs = require('fs')
  ;

function logErrorAndDieIfExists(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
}

function readyMsg(port) {
  console.log('server listening at port %s', port);
}

init((err) => {
  logErrorAndDieIfExists(err);

  var httpsOptions
    , server = require('_/server')
    , config = require('_/config/config')
    , port = config.get('server.port')
    , readyMsgBound = readyMsg.bind(null, port)
    ;

  if (config.get('server.enableHttps')) {
    console.log('starting with HTTPS');

    httpsOptions = {
      key: fs.readFileSync(config.get('server.httpsKey')),
      cert: fs.readFileSync(config.get('server.httpsCert')),
      requestCert: false
    };

    https.createServer(httpsOptions, server).listen(port, readyMsgBound);
  } else {
    console.log('starting without HTTPS');
    server.listen(port, readyMsgBound);
  }
});
