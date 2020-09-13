var express = require('express');
var router = express.Router();
let auth = require('../common/authenticateHelper');

/**
 * @swagger
 * /:
 *   get:
 *     description: Redirects to the documentation page.
 *     produces:
 *       - application/html
 *     responses:
 *       200:
 *         description: An array of users and their respective details.
 */
router.get('/', (req, res) => {res.redirect('/docs')});
/* GET home page. */
router.get('/a', auth.checkAuthenticated, function(req, res, next) {
  res.render('index.ejs', { name: req.user.name });
});


module.exports = router;
