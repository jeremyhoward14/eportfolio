var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth')
var User = require('../models/users')
const userController = require('../controllers/users')

/**
 * @swagger
 * /files/{projectid}/upload:
 *   post:
 *     tags:
 *       - posts
 *     description: This route simply tests if auth works. Intended to be used for testing authentication.
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: returns user object.
 */
router.get('/', auth, async (req, res) => {
    const user = await User.findOne({username: req.user.username});
    res.json({
        user: userController.getPublicUserObject(user)
      });
});

module.exports = router;
