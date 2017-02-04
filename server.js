// Server/router/controller for the API service (at the moment)
// TODO: Should handlers be moved out?
const port = 8080;

const dbconnect  = require('./app/db/dbconnect')
const express    = require('express');
const multer     = require('multer');
const upload     = multer({dest: 'storage/images/'});
const bodyParser = require('body-parser');

const mongo = require('mongodb');
const ObjectID = mongo.ObjectID;

// Get that express instance!
const app = express();

// Wire up JSON request parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Get cards db handle
var cardsDb = null;
dbconnect.getConn('cardtest', function(err, db) {
  if (err) throw err;

  cardsDb = db;
});

// TODO: Set appropriate http status
function okJsonRes(res, data) {
  var resObj = {
    "status": "ok"
  };

  Object.assign(resObj, data);
  res.json(resObj);
}

function errJsonRes(res, err) {
  res.json({
    "status": "error",
    "errorMsg": err
  })
}

// Routes
var router = express.Router();

// Test route
router.get('/ping', function(req, res) {
  res.json({ message: 'I\'m up!' });
});

router.post('/save_card', function(req, res) {
  var cards = cardsDb.collection('cards');

  cards.insertOne(req.body, function(err, result) {
    if (err) {
      errJsonRes(res, err);
    } else {
      okJsonRes(res, {
        "id": result["insertedId"]
      });
    }
  });
});

router.post('/save_image', upload.single('image'), function(req, res) {
  if (!(req.file && req.file.filename)) {
    errJsonRes(res, "Upload failed");
    return;
  }

  var images = cardsDb.collection('images');

  images.insertOne({
    "filename": req.file.filename
  }, function(err, result) {
    if (err) {
      errJsonRes(res, err);
    } else {
      okJsonRes(res, {
        "id": result["insertedId"]
      });
    }
  });
});

const generator = require('./app/generator');

router.get('/generate/:card_id', function(req, res) {
  var cards = cardsDb.collection('cards');
  var cardData = cards.findOne({
    "_id": ObjectID(req.params.card_id)
  }, function(err, result) {
    if (err) {
      res.json({
        "status": "error",
        "errorMsg": err
      });
    } else {
      generator.generate(result, function(err, image) {
        if (err) {
          errJsonRes(res, err);
        } else {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.send(image);
        }
      });
    }
  });
});

// Register all routes at /
app.use('/', router);

// Start server
app.listen(port);
console.log('Server running on port ' + port);
