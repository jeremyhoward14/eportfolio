var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth')
var User = require('../models/users')

//This route simply tests if auth works. Intended to be used for testing authentication.
router.get('/', auth, async (req, res) => {
    //res.json({posts: {title: 'my first post', description: 'random data you should not access'}})});
    const user = await User.findOne({username: req.user.username});
    return res.status(200).send(user);
});

module.exports = router;
