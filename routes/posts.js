var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth')
var User = require('../models/users')

//This route simply tests if auth works. Intended to be used for testing authentication.
router.get('/:id', auth, async (req, res) => {
    //res.json({posts: {title: 'my first post', description: 'random data you should not access'}})});
    User.findOne({ username: req.params.id})
      .then(user => {
        if (user) {
          res.send(user);
        } else{
          res.status(500).send("Database error");
        }        
      })
});

module.exports = router;
