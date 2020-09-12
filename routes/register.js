var express = require('express');
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

let users = require('../db/db');
let auth = require('../common/authenticateHelper');
router.get('/', auth.checkNotAuthenticated, function(req, res) {
  res.render('register.ejs');
});

router.post('/', auth.checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        }) 
        res.redirect('/login');
    }
    catch{
        res.redirect('/register');
    }
    console.log(users);
})

module.exports = router;