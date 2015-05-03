var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile('site/index-fullscreen.html');
});

module.exports = router;
