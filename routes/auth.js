const e = require('express');
var express = require('express');

//Create router
var router = express.Router();
//Require user controller
const authController = require("../controllers/auth");

router.post("/", (req, res)=> authController.authUser(req, res));

module.exports = router;