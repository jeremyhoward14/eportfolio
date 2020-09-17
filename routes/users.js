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
 */
router.get("/", (req, res) => userController.getAllUsers(req, res));

/**
 * @swagger
 * /users/signup:
 *   post:
 *     description: Supplying user schema adds user to database after checking validation.
 *     parameters:
 *       - name: username
 *       - name: email
 *       - name: password
 *       - name: firstname
 *       - name: lastname
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: JSON of registered user with attached token
 *       400:
 *         description: validation error
 *       
 */
router.post("/signup", (req, res)=> userController.registerUser(req, res));

/**
 * @swagger
 * /users/login:
 *   post:
 *     description: log in
 *     parameters:
 *       - name: email
 *       - name: password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: returns JWT of user and user's id as user.token and user.id
 *       400:
 *         description: validation error
 *       
 */
router.post("/login", async (req, res) => userController.loginUser(req, res));


module.exports = router;
