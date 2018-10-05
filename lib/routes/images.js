var reqlib = require('app-root-path').require
  , pathUtils = reqlib('lib/path-utils')
  , resUtils = reqlib('lib/routes/util/res-utils')
  , DedupFile = reqlib('lib/models/dedup-file')
  , urlHelper = reqlib('lib/url-helper')
  , resUtils = reqlib('lib/routes/util/res-utils')
  , path = require('path')
  ;

var uploadStoragePath = pathUtils.storagePath('uploaded_images');

function saveImage(req, res) {
  DedupFile.findOrCreateFromBuffer(req.body, req.appId, req.params.userId,
    uploadStoragePath, (err, dedupFile) => {
      var url;

      if (err) return resUtils.errJsonRes(res, err);

      url = urlHelper.imageUrl(dedupFile);

      resUtils.jsonRes(res, resUtils.httpStatus.ok, {
        url: url,
        thumbUrl: url // TODO: create real thumbs?
      });
    }
  );
}
module.exports.saveImage = saveImage;

function getImage(req, res) {
  var imageId = req.params.imageId;

  DedupFile.findById(imageId, (err, file) => {
    if (err) {
     return resUtils.errJsonRes(res, err);
    }

    if (!file) {
      return resUtils.jsonRes(res, resUtils.httpStatus.notFound,
        { msg: 'Image ' + imageId + ' not found' });
    }

    file.read((err, buffer) => {
      if (err) return resUtils.errJsonRes(res, err);

      // TODO: gross
      if (!buffer) return errJsonRes(res, { msg: "not found"});

      res.setHeader('Content-Type', file.mimeType);
      res.send(buffer);
    });
  });
}
module.exports.getImage = getImage;
