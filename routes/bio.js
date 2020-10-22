var express = require('express');
const auth = require("../middleware/auth");

//Create Router
var router = express.Router();
//Require the bio controller
const bioController = require("../controllers/bio");

//Available routes

/**
 * @swagger
 * /bio/{username}:
 *   get:
 *     tags:
 *       - bio
 *     description: Returns a single user's bio.
 *     parameters:
 *       - in: path
 *         name: username
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
 *         description: A user's bio.
 */
router.get("/:username", (req, res) => bioController.getBio(req, res));


/**
 * @swagger
 * /bio/update:
 *   post:
 *     tags:
 *       - bio
 *     description: Update a bio
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *       - in: body
 *         name: bio
 *         description: The user's bio
 *         schema:
 *           type: object
 *           required:
 *             - bio
 *           properties:
 *             bio:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully updated the bio
 *       404:
 *         description: User could not be found in database
 *       
 */
router.post("/update", auth, (req, res) => bioController.updateBio(req, res));


module.exports = router;