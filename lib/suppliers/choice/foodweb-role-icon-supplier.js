var urlHelper = require('../../url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    { label: 'Apex predator', url: urlHelper.staticImageUrl('foodweb_icons/APEX.png')},
    { label: 'Autotroph', url: urlHelper.staticImageUrl('foodweb_icons/AUTO.png')},
    { label: 'Carnivore', url: urlHelper.staticImageUrl('foodweb_icons/CARN.png')},
    { label: 'Decomposer', url: urlHelper.staticImageUrl('foodweb_icons/DECO.png')},
    { label: 'Detritivore', url: urlHelper.staticImageUrl('foodweb_icons/DETR.png')},
    { label: 'Herbivore', url: urlHelper.staticImageUrl('foodweb_icons/HERB.png')},
    { label: 'Omnivore', url: urlHelper.staticImageUrl('foodweb_icons/OMNI.png')},
    { label: 'Sanguinivore', url: urlHelper.staticImageUrl('foodweb_icons/SANG.png')}
  ]);
}
