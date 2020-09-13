const e = require('express');
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

router.post("/register", (req, res)=> userController.registerUser(req, res));

router.post("/login", (req, res) => userController.loginUser(req, res));

router.get('/logout', (req, res) => userController.logOutUser(req, res));

module.exports = router;
