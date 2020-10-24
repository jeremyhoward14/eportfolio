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
 *             - text
 *             - socials
 *             - category
 *           properties:
 *             text:
 *               type: string
 *             socials:
 *               type: array
 *               items:
 *                 type: string
 *             category:
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



const fileHandler = require("../controllers/files")
const awsAdaptor = require("../models/aws")
/**
 * @swagger
 * /profile/uploadDP:
 *   post:
 *     tags:
 *       - profile
 *     description: Uploads profile picture to <aws url>/<username>/dp.<ext>. File comes in as binary data.
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *       - in: formData
 *         name: userFile
 *         required: true
 *         type: file
 *         description: The image to upload.
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns URL the file was uploaded to.
 *       500:
 *         description: Server error.
 */
router.post("/uploadDP", auth, awsAdaptor.uploadDP.single('userFile'), (req, res) => fileHandler.uploadDP(req, res));


/**
 * @swagger
 * /profile/deleteDP:
 *   post:
 *     tags:
 *       - profile
 *     description: deletes the logged in user's DP
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
 *         description: successfully deleted dp.
 *       400:
 *         description: user does not have a dp.
 *       500:
 *         description: Server error.
 */
router.post("/deleteDP", auth, (req, res) => fileHandler.deleteDPRoute(req, res));

module.exports = router;
