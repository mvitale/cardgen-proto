var urlHelper = require('../../url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    { label: 'Least concern (LC)', url: urlHelper.staticImageUrl('iucn_icons/LC.svg') },
    { label: 'Near threatened (NT)', url: urlHelper.staticImageUrl('iucn_icons/NT.svg') },
    { label: 'Vulnerable (VU)', url: urlHelper.staticImageUrl('iucn_icons/VU.svg') },
    { label: 'Endangered (EN)', url: urlHelper.staticImageUrl('iucn_icons/EN.svg') },
    { label: 'Critically endangered (CR)', url: urlHelper.staticImageUrl('iucn_icons/CR.svg') },
    { label: 'Extinct in the wild (EW)', url: urlHelper.staticImageUrl('iucn_icons/EW.svg') },
    { label: 'Extinct (EX)', url: urlHelper.staticImageUrl('iucn_icons/EX.svg') }
  ]);
};
