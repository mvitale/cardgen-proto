/*
 * Server/router/controller for the Cards service
 */
var port = 8080;

var express          = require('express');
var multer           = require('multer');
var bodyParser       = require('body-parser');
var mongo            = require('mongodb');
var cors             = require('cors');
var morgan           = require('morgan');

var dbconnect        = require('./dbconnect');
var dedupDiskStorage = require('./dedup-disk-storage');
var templateManager  = require('./template-manager');
var generator        = require('./generator');
var urlHelper        = require('./url-helper');

var Card             = require('./models/card');
var DedupFile        = require('./models/dedup-file');

var CardWrapper      = require('./api-wrappers/card-wrapper');
var TemplateWrapper  = require('./api-wrappers/template-wrapper');

/*
 * Map human-readable names to http statuses
 */
var HTTP_STATUS = {
  'created': 201,
  'internalError': 500,
  'ok': 200,
  'notFound': 404
};

/*
 * Form/multipart upload handler. Only used for images.
 */
var upload = multer({
  storage: dedupDiskStorage({
    destination: 'storage/images/'
  })
});

// Get that express instance
var app = express();

// TODO: remove. Hack to allow client JS to call service directly during
// development.
app.use(cors());

// Request Logging
app.use(morgan('common'));

// Wire up JSON request parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// TODO: Set appropriate http status
function okJsonRes(res, data) {
  var resObj = {
    "status": "ok"
  };

  Object.assign(resObj, data);
  res.json(resObj);
}

function errJsonRes(res, err) {
  console.log(err);
  jsonRes(res, 'internalError', {
    'error': JSON.stringify(err)
  });
}

function jsonRes(res, status, data) {
  res.status(HTTP_STATUS[status]).json(data);
}

/*
 * ROUTES
 */
var router = express.Router();

/*
 * Test route
 */
router.get('/ping', function(req, res) {
  res.json({ message: 'I\'m up!' });
});

/*
 * Create a new Card with a given template and templateParams.
 * Expects JSON of the form:
 *
 * {
 *   "templateName": "<template name>",
 *   "templateParams": {
 *     "<template param 1 key>": <template param 1 val>,
 *     ...
 *     "<template param n key">: <tempalte param 1 val>
 *   }
 * }
 *
 * Responds with JSON representation of the new Card, which includes the
 * Card id. See api-wrappers/card-wrapper.js.
 */
router.post('/cards', (req, res) => {
  var card = new Card(req.body);

  card.populateDefaultsAndChoices((err) => {
    if (err) return errJsonRes(res, err);

    card.save((err, card) => {
      if (err) return errJsonRes(res, err);

      jsonRes(res, 'created', new CardWrapper(card));
    });
  });
});

/*
 * PUT a given card's data field.
 *
 * Parameters:
 *  cardId: a valid card ID (as returned from /cards POST)
 *
 * Response:
 *  JSON respresentation of the updated Card.
 */
router.put('/cards/:cardId/data', (req, res) => {
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

/*
 * GET the JSON representation of a given Card.
 *
 * Parameters:
 *  cardId: A valid Card id
 *
 * Response:
 *  JSON representation of the Card with id cardId
 */
router.get('/cards/:cardId', (req, res) => {
  Card.findById(req.params.cardId, (err, card) => {
    if (err) {
      errJsonRes(res, err);
    } else {
      jsonRes(res, 'ok', card);
    }
  })
});

/*
 * Image upload endpoint. POST a multipart form with a single field "image".
 * This call is idempotent: if it is called multiple times with the same <<exact>>
 * image file, it returns the same url eac time.
 *
 * Response:
 *  {
 *    "url": "<image url>"
 *  }
 *
 * TODO: document supported file types
 *
 */
router.post('/images', upload.single('image'), (req, res) => {
  if (!(req.file && req.file.dedupFile)) {
    errJsonRes(res, "Upload failed");
    return;
  }

  okJsonRes(res, {
    "url": urlHelper.imageUrl(req.file.dedupFile)
  });
});

/*
 * GET an SVG of a given card.
 *
 * Parameters:
 *  cardId: A valid Card id
 *
 * Response:
 *  An SVG representation of the Card
 */
router.get('/cards/:cardId/render', (req, res) => {
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

/*
 * Get template data (fields, etc.) for a given template
 *
 * Parameters:
 *  templateName: A valid Template name (see templates directory)
 *
 * Response:
 *  JSON representation of the Template (see api-wrappers/template-wrapper.js)
 */
router.get('/templates/:templateName', function(req, res) {
  templateManager.getTemplate(req.params.templateName, (err, template) => {
    if (err) {
      errJsonRes(res, err);
    } else {
      jsonRes(res, 'ok', new TemplateWrapper(template));
    }
  });
});

app.use('/', router);

// Files in public directory are accessible at /static
app.use('/static', express.static('public'));

/*
 * Open mongoose database connection, then start the server.
 */
dbconnect.mongooseInit((err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  app.listen(port);
  console.log('Server running on port ' + port);
});
