var reqlib = require('app-root-path').require;
var httpStatus = {
  'created': 201,
  'internalError': 500,
  'ok': 200,
  'badRequest': 400,
  'notFound': 404,
  'unprocessableEntity': 422
};
module.exports.httpStatus = httpStatus;

function validationErrRes(res, errors) {
  jsonRes(res, httpStatus.unprocessableEntity, {
    msg: 'Validation failure',
    errors: errors
  });
}

function handleModelErr(res, err) {
  var uniqueMsgs
    , curError
    ;

  // TODO: log original error
  if (err.name === 'ValidationError') {
    res.log.info({err: err}, 'Handling ValidationError');

    if (err.errors) {
      uniqueMsgs = {};

      for (key in err.errors) {
        error = err.errors[key];

        if (error.message) {
          uniqueMsgs[error.message] = true;
        }
      }

      return validationErrRes(res, Object.keys(uniqueMsgs));
    } else if (err.message) {
      return validationErrRes(res, [err.message]);
    }
  }

  errJsonRes(res, err);
}
module.exports.handleModelErr = handleModelErr;

function errJsonRes(res, err) {
  if (res.log) {
    res.log.error({ err: err }, 'Unhandled error');
  } else {
    console.error('Unhandled error', err);
  }

  jsonRes(res, err.status || httpStatus.internalError, {
    msg: 'An unexpected error occurred'
  });
}
module.exports.errJsonRes = errJsonRes;

function notFoundJsonRes(res, err) {
  if (res.log) {
    res.log.error({ err: err }, 'Resource not found');
  }

  jsonRes(res, httpStatus.notFound, {
    msg: err.msg || 'resource not found'
  });
}
module.exports.notFoundJsonRes = notFoundJsonRes;

function jsonRes(res, status, data) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(data);
}
module.exports.jsonRes = jsonRes;
