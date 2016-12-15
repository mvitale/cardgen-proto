const generator = require('./generator');
const fs = require('fs');
const Image = require('canvas').Image;

var leatherbackImg = null;

fs.readFile('/Users/mvitale/projects/eol/cardgen/app/images/leatherback.jpg', function(err, turtle) {
  if (err) throw err;
  leatherbackImg = new Image;
  leatherbackImg.src = turtle;
});

generator.generate({ 
  'template': 'trait',
  'content': {
    'commonName': 'Leatherback Sea Turtle',
    'sciName': 'Dermocheyls coriacea',
    'image': leatherbackImg
  }
});
