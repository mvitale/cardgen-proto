const port = 8080;
const mongoPort = 27017;

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var cardsDb = null;
MongoClient.connect('mongodb://localhost:' + mongoPort + '/cardtest', function (err, db) {
  if (err) throw err;
  cardsDb = db;
});

// Routes
var router = express.Router();

// Test route
router.get('/ping', function(req, res) {
  res.json({ message: 'I\'m up!' });
});

router.post('/save', function(req, res) {
  console.log(req.body);
  res.json(req.body);
});

// Register all routes at /
app.use('/', router);

// Start server
app.listen(port);
console.log('Server running on port ' + port);

