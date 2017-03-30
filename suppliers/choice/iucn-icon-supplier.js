var urlHelper = require('../../url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    { label: 'Least concern (LC)', url: urlHelper.staticImageUrl('iucn_icons/LC.png') },
    { label: 'Near threatened (NT)', url: urlHelper.staticImageUrl('iucn_icons/NT.png') },
    { label: 'Vulnerable (VU)', url: urlHelper.staticImageUrl('iucn_icons/VU.png') },
    { label: 'Endangered (EN)', url: urlHelper.staticImageUrl('iucn_icons/EN.png') },
    { label: 'Critically endangered (CR)', url: urlHelper.staticImageUrl('iucn_icons/CR.png') },
    { label: 'Extinct in the wild (EW)', url: urlHelper.staticImageUrl('iucn_icons/EW.png') },
    { label: 'Extinct (EX)', url: urlHelper.staticImageUrl('iucn_icons/EX.png') }
  ]);
};
