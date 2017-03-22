var urlHelper = require('../../url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    { label: 'Apex predator', url: urlHelper.staticImageUrl('foodweb_icons/APEX.svg')},
    { label: 'Autotroph', url: urlHelper.staticImageUrl('foodweb_icons/AUTO.svg')},
    { label: 'Carnivore', url: urlHelper.staticImageUrl('foodweb_icons/CARN.svg')},
    { label: 'Decomposer', url: urlHelper.staticImageUrl('foodweb_icons/DECO.svg')},
    { label: 'Detritivore', url: urlHelper.staticImageUrl('foodweb_icons/DETR.svg')},
    { label: 'Herbivore', url: urlHelper.staticImageUrl('foodweb_icons/HERB.svg')},
    { label: 'Omnivore', url: urlHelper.staticImageUrl('foodweb_icons/OMNI.svg')},
    { label: 'Sanguinivore', url: urlHelper.staticImageUrl('foodweb_icons/SANG.svg')}
  ]);
}
