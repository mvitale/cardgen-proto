var express = require("express");
var app = express();
var port = 8080;

// Routes
var router = express.Router();

// Test route
router.get('/', function(req, res) {
  res.json({ message: 'API functioning!' });
});

// Register all routes at /
app.use('/', router);

// Start server
app.listen(port);
console.log('Make requests to port ' + port);
