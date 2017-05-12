var httpStatus = {
  'created': 201,
  'internalError': 500,
  'ok': 200,
  'notFound': 404
};
module.exports.httpStatus = httpStatus;

function okJsonRes(res, data) {
  var resObj = {
    "status": "ok"
  };

  Object.assign(resObj, data);
  res.json(resObj);
}
module.exports.okJsonRes = okJsonRes;

function errJsonRes(res, err) {
  jsonRes(res, httpStatus.internalError, {
    'error': JSON.stringify(err)
  });
}
module.exports.errJsonRes = errJsonRes;

function jsonRes(res, status, data) {
  res.status(status).json(data);
}
module.exports.jsonRes = jsonRes;
