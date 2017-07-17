var init = require('./init')
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
  var httpsOptions;

  logErrorAndDieIfExists(err);

  var server = require('./server')
    , config = require('_/config/config')
    , port = config.get('server.port')
    , readyMsgBound = readyMsg.bind(null, port)
    ;

  if (config.get('server.enableHttps')) {
    console.log('starting with HTTPS');
    httpsOptions = {
      key: fs.readFileSync('/etc/pki/tls/private/card-svc-selfsigned.key'),
      cert: fs.readFileSync('/etc/pki/tls/certs/card-svc-selfsigned.crt'),
      requestCert: false,
      rejectUnauthorized: false
    };
    https.createServer(httpsOptions, server).listen(port, readyMsgBound);
  } else {
    console.log('starting without HTTPS');
    server.listen(port, readyMsgBound);
  }
});
