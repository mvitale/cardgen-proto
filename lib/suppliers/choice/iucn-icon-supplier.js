var urlHelper = require('_/url-helper');

module.exports.supply = function(params, apiResults, cb) {
  cb(null, [
    {
      label: 'Least concern (LC)',
      url: urlHelper.staticImageUrl('iucn_icons/LC.png'),
      choiceKey: 0
    },
    {
      label: 'Near threatened (NT)',
      url: urlHelper.staticImageUrl('iucn_icons/NT.png'),
      choiceKey: 1
    },
    {
      label: 'Vulnerable (VU)',
      url: urlHelper.staticImageUrl('iucn_icons/VU.png'),
      choiceKey: 2
    },
    {
      label: 'Endangered (EN)',
      url: urlHelper.staticImageUrl('iucn_icons/EN.png'),
      choiceKey: 3
    },
    {
      label: 'Critically endangered (CR)',
      url: urlHelper.staticImageUrl('iucn_icons/CR.png'),
      choiceKey: 4
    },
    {
      label: 'Extinct in the wild (EW)',
      url: urlHelper.staticImageUrl('iucn_icons/EW.png'),
      choiceKey: 5
    },
    {
      label: 'Extinct (EX)',
      url: urlHelper.staticImageUrl('iucn_icons/EX.png'),
      choiceKey: 6
    },
    {
      label: 'Data deficient (DD)',
      url: urlHelper.staticImageUrl('iucn_icons/DD.png'),
      choiceKey: 7
    },
    {
      label: 'Not evaluated (NE)',
      url: urlHelper.staticImageUrl('iucn_icons/NE.png'),
      choiceKey: 8 
    }
  ]);
};
