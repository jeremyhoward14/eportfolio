var express = require('express');
const auth = require('../middleware/auth');

//Create router
var router = express.Router();
//Require user controller
const userController = require("../controllers/users");

//Available routes
/**
 * @swagger
 * /users:
 *   get:
 *     description: Returns all users.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users and their respective details.
 *       500:
 *         description: No users were found.
 */
router.get("/", (req, res) => userController.getAllUsers(req, res));

/**
 * @swagger
 * /users/{id} :
 *   get:
 *     description: Returns a single user.
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
 *         description: A user array with their respective details.
 */
router.get("/:id", (req, res) => userController.getOneUser(req, res));


/**
 * @swagger
 * /users/signup:
 *   post:
 *     description: Supplying user schema adds user to database after checking validation.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to create.
 *         schema:
 *           type: object
 *           required:
 *             - username
 *             - email
 *             - password
 *             - firstname
 *             - lastname
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             firstname:
 *               type: string
 *             lastname:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Created registered user and returns JWT of user.
 *       400:
 *         description: validation error
 *       
 */
router.post("/signup", (req, res)=> userController.registerUser(req, res));


/**
 * @swagger
 * /users/login:
 *   post:
 *     description: Checks if the password matches email.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The email and password.
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns JWT of user and user's id as user.token and user.id
 *       400:
 *         description: validation error
 *       
 */
router.post("/login", async (req, res) => userController.loginUser(req, res));


module.exports = router;
