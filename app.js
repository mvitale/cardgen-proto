// Server/router/controller for the API service (at the moment)
// TODO: Should handlers be moved out?
var port = 8080;

var express    = require('express');
var multer     = require('multer');
var bodyParser = require('body-parser');
var mongo      = require('mongodb');
var dbconnect  = require('./dbconnect');
var dot        = require('mongo-dot-notation');

var HTTP_STATUS = {
  'created': 201,
  'internalError': 500,
  'ok': 200,
  'notFound': 404
}

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
  jsonRes(res, 'internalError', {
    'error': err
  });
}

function jsonRes(res, status, data) {
  res.status(HTTP_STATUS[status]).json(data);
}

// Routes
var router = express.Router();

// Test route
router.get('/ping', function(req, res) {
  res.json({ message: 'I\'m up!' });
});

router.post('/cards', function(req, res) {
  var cards = cardsDb.collection('cards');

  cards.insertOne(req.body, function(err, result) {
    if (err) {
      errJsonRes(res, err);
    } else {
      jsonRes(res, 'created', {
        'id': result['insertedId']
      });
    }
  });
});

router.patch('/cards/:cardId', function(req, res) {
  var id = null;

  if (!ObjectID.isValid(req.params.cardId)) {
    jsonRes(res, 'notFound', {});
    return;
  }

  id = ObjectID(req.params.cardId);

  // create $set instruction using dot notation, which causes mongo to update
  // only the fields passed in
  var instructions = dot.flatten(req.body);

  cardsDb.collection('cards').findOneAndUpdate({
    '_id': id
  }, instructions, {'returnOriginal': false}, function(err, result) {
    if (err) {
      errJsonRes(res, err);
    } else {
      if (!(result.ok === 1)) {
        jsonRes(res, 'notFound', {});
      } else {
        jsonRes(res, 'ok', result.value);
      }
    }
  });
});

router.post('/images', upload.single('image'), function(req, res) {
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
