var express = require('express');
var router = express.Router();
let users = require('../db/db');

let auth = require('../common/authenticateHelper');

const passport = require('passport');
const initializePassport = require('../config/passport-config');
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

router.get('/', auth.checkNotAuthenticated, function(req, res) {
  res.render('login.ejs');
});

router.post('/', auth.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

router.delete('/', (req, res) => {
    req.logOut()
    res.redirect('/login');
  })  

module.exports = router;
