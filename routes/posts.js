var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth')
var User = require('../models/users')

router.get('/', auth, async (req, res) => {
    //res.json({posts: {title: 'my first post', description: 'random data you should not access'}})});
    console.log(req.user);
    const user = await User.findOne({_id: req.user.id});
    return res.status(200).send(user);
});

module.exports = router;
