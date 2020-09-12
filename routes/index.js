var express = require('express');
var router = express.Router();

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


module.exports = router;
