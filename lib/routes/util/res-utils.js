var httpStatus = {
  'created': 201,
  'internalError': 500,
  'ok': 200,
  'notFound': 404
};
module.exports.httpStatus = httpStatus;

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
