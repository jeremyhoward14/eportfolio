var express = require('express');

// create router
var router = express.Router();
// require user controller
const userController = require("../controllers/users");


// available routes
router.get("/", (req, res) => userController.getAllUsers(req, res));

module.exports = router;
