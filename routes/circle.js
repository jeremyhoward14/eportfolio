var express = require('express');
const auth = require('../middleware/auth');

//Create router
var router = express.Router();
//Require user controller
const circleController = require("../controllers/circle");

/**
 * @swagger
 * /circle/add/{friend}:
 *   post:
 *     tags:
 *       - circles
 *     description: Add a friend to your circle
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: friend
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: username to be added to circle
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
 *         description: Successfully added friend to circle
 *       400:
 *         description: Friend already part of circle
 *       404:
 *         description: User could not be found in database
 *       
 */
router.post("/add/:friend", auth, async (req, res) => circleController.addToCircle(req, res));

/**
 * @swagger
 * /circle/remove/{friend}:
 *   post:
 *     tags:
 *       - circles
 *     description: Remove friend from your circle
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: friend
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: username to be removed from circle
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
 *         description: Successfully removed friend to circle
 *       400:
 *         description: Cannot delete self
 *       404:
 *         description: Could not find user in circle
 *       
 */
router.post("/remove/:friend", auth, async (req, res) => circleController.removeFromCircle(req, res));

/**
 * @swagger
 * /circle/{id}:
 *   get:
 *     tags:
 *       - circles
 *     description: Returns a single user's circle.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: username
 *     produces:
 *       - application/json
 *     responses:
 *       404:
 *         description: User does not exist.
 *       200:
 *         description: A user's circle.
 */
router.get("/:id", async (req, res) => circleController.getCircle(req, res));


module.exports = router;
