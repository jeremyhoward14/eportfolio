var express = require('express');

//Create router
var router = express.Router();

// file handler
const fileHandler = require("../controllers/files");

//Available routes

/**
 * @swagger
 * /projects/{projectid}/upload:
 *   post:
 *     description: Uploads supplied file to aws s3 server
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The file to upload.
 *         schema:
 *           type: object
 *           required:
 *             - file
 *             - username
 *             - projectname
 *           properties:
 *             username:
 *               type: string
 *             file:
 *               type: string
 *             projectname:
 *               type: string
 *       - in: path
 *         name: projectid
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: project id
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns URL the file was uploaded to (to be submitted to mongodb)
 *       400:
 *         description: validation error
 *       
 */
router.post("/:projectid/upload", (req, res) => fileHandler.uploadFile(req, res));


/**
 * @swagger
 * /projects/{projectid}/delete:
 *   post:
 *     description: Deletes file wiuth supplied name from aws s3 server
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The filename to delete.
 *         schema:
 *           type: object
 *           required:
 *             - filename
 *             - username
 *             - projectname
 *           properties:
 *             username:
 *               type: string
 *             filename:
 *               type: string
 *             projectname:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: validation error
 *       
 */
router.post("/projects/:projectid/delete", async (req, res) => fileHandler.deleteFile(req, res));


module.exports = router;
