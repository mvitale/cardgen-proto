var httpStatus = {
  'created': 201,
  'internalError': 500,
  'ok': 200,
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

  if (err.name === 'ValidationError') {
    console.log(err);
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
  res.log.error({ err: err }, 'Unhandled error');

  jsonRes(res, httpStatus.internalError, {
    'msg': 'An unexpected error occurred'
  });
}
module.exports.errJsonRes = errJsonRes;

function jsonRes(res, status, data) {
  res.status(status).json(data);
}
module.exports.jsonRes = jsonRes;
