var express = require('express');
var router = express.Router();
let users = require('../db/db');
let auth = require('../common/authenticateHelper');
const passport = require('passport');
/* GET home page. */
router.get('/', auth.checkAuthenticated, function(req, res, next) {
  res.render('index.ejs', { name: req.user.name });
});

module.exports = router;
