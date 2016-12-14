const generator = require('./generator');
const fs = require('fs');
const Image = require('canvas').Image;

var leatherbackImg = null;

fs.readFile(__dirname + '/images/leatherback.jpg', function(err, turtle) {
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
