var express = require('express');
const auth = require("../middleware/auth");

//Create Router
var router = express.Router();
//Require the profile controller
const profileController = require("../controllers/profile");

//Available routes

/**
 * @swagger
 * /profile/bio/{username}:
 *   get:
 *     tags:
 *       - profile
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
router.get("/bio/:username", (req, res) => profileController.getBio(req, res));


/**
 * @swagger
 * /profile/bio/update:
 *   post:
 *     tags:
 *       - profile
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
 *       400:
 *         description: Bio was empty.
 *       404:
 *         description: User could not be found in database.
 */
router.post("/bio/update", auth, (req, res) => profileController.updateBio(req, res));


/**
 * @swagger
 * /profile/name/update:
 *   post:
 *     tags:
 *       - profile
 *     description: Update a first and last name
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
 *         name: firstname & lastname
 *         description: The user's firstname
 *         schema:
 *           type: object
 *           required:
 *             - firstname
 *             - lastname
 *           properties:
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully updated the firstname and lastname.
 *       400:
 *         description: Firstname or lastname was empty.
 *       404:
 *         description: User could not be found in database.
 */
router.post("/name/update", auth, (req, res) => profileController.updateName(req, res));


module.exports = router;