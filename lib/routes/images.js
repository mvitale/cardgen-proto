var resUtils = require('_/routes/util/res-utils')
  , DedupFile = require('_/models/dedup-file').DedupFile
  , urlHelper = require('_/url-helper')
  , resUtils = require('_/routes/util/res-utils')
  , path = require('path')
  ;

function saveImage(req, res) {
  DedupFile.findOrCreateFromBuffer(req.body, req.params.userId,
    path.join(__dirname, '../..', 'storage/uploaded_images'), (err, dedupFile) => {
      if (err) return resUtils.errJsonRes(res, err);
      resUtils.jsonRes(res, resUtils.httpStatus.ok, { url: urlHelper.imageUrl(dedupFile) });
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
