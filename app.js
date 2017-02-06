// Server/router/controller for the API service (at the moment)
// TODO: Should handlers be moved out?
var port = 8080;

var express    = require('express');
var multer     = require('multer');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var dbconnect  = require('./dbconnect')

// Needed for querying mongo records on _id field
// TODO: Should records get a new string guid field to be exposed via the API?
var ObjectID = mongo.ObjectID;

// form/multipart upload handler
var upload = multer({dest: 'storage/images/'});

// Get that express instance!
var app = express();

// Wire up JSON request parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Will hold cards db handle (see below)
var cardsDb = null;

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

var generator = require('./generator');

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

// Get a db connection and start the server
dbconnect.getConn('cardtest', function(err, db) {
  if (err) throw err;

  cardsDb = db;

  app.listen(port);
  console.log('Server running on port ' + port);
});
