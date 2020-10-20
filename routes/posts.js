var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth')
var User = require('../models/users')

//This route simply tests if auth works. Intended to be used for testing authentication.
router.get('/', auth, async (req, res) => {
    const user = await User.findOne({username: req.user.username});
    res.json({
        user: {
          id: user.id,
          username: user.username,
          email:user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          projects: user.projects,
          circle: user.circle,
          bio: user.bio

        }
      });
});

module.exports = router;
