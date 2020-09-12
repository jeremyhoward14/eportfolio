var express = require('express');

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

module.exports = router;
