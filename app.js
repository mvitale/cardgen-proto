// Server/router/controller for the API service (at the moment)
// TODO: Should handlers be moved out?
var port = 8080;

var express    = require('express');
var multer     = require('multer');
var bodyParser = require('body-parser');
var mongo      = require('mongodb');
var cors       = require('cors');
var fs         = require('fs');

var Card       = require('./models/card');

var dbconnect  = require('./dbconnect');
var dedupDiskStorage = require('./dedup-disk-storage');
var templateManager = require('./template-manager');
var generator = require('./generator');

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
var upload = multer({
  storage: dedupDiskStorage({
    destination: 'storage/images/'
  })
});

// Get that express instance!
var app = express();

// TODO: remove
app.use(cors());

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
  var card = new Card(req.body);

  card.populateDefaultsAndChoices((err) => {
    if (err) return errJsonRes(res, err);

    card.save((err, card) => {
      if (err) return errJsonRes(res, err);

      jsonRes(res, 'created', card);
    });
  });
});

router.put('/cards/:cardId', function(req, res) {
  Card.findById(req.params.cardId, (err, card) => {
    if (err) {
      errJsonRes(res, err);
    } else {
      card.data = req.body;

      card.save((err) => {
        if (err) {
          errJsonRes(res, err);
        } else {
          jsonRes(res, 'ok', card);
        }
      })
    }
  });
});

router.post('/images', upload.single('image'), function(req, res) {
  if (!(req.file && req.file.dedupFile)) {
    errJsonRes(res, "Upload failed");
    return;
  }

  okJsonRes(res, {
    "id": req.file.dedupFile._id
  });
});

router.get('/cards/:cardId/export', function(req, res) {
  Card.findById(req.params.cardId, (err, card) => {
    if (err) {
      return errJsonRes(res, err);
    } else {
      generator.generate(card, (err, svg) => {
        if (err) {
          return errJsonRes(res, err);
        } else {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.send(svg);
        }
      })
    }
  });
});

router.get('/templates/:templateName', function(req, res) {
  templateManager.getTemplate(req.params.templateName, (err, template) => {
    if (err) {
      errJsonRes(res, err);
    } else {
      jsonRes(res, 'ok', template);
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
