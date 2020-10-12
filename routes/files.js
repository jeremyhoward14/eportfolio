var express = require('express');

//Create router
var router = express.Router();

const auth = require("../middleware/auth");

// file handler
const fileHandler = require("../controllers/files");

//Available routes

/**
 * @swagger
 * /files/{projectid}/upload:
 *   post:
 *     description: Uploads supplied file to aws s3 server and attaches it to project
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *       - in: path
 *         name: projectid
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: project id
 *       - in: body
 *         name: user
 *         description: The file to upload.
 *         schema:
 *           type: object
 *           required:
 *             - file
 *           properties:
 *             file:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Returns URL the file was uploaded to.
 *       404:
 *         description: Could not find specified project-id for user.
 *       500:
 *         description: Could not insert url into database.
 *       
 */
router.post("/:projectid/upload", auth, async (req, res) => fileHandler.uploadFile(req, res));

const awsAdaptor = require("../models/aws");
const verifyProjectExists = require("../middleware/verifyProjectExists");
/**
 * @swagger
 * /files/{projectid}/multerUpload:
 *   post:
 *     description: Uploads incoming file to aws s3 server and attaches it to project. File comes in as binary data. (Note that it seems to be easy to test this with PostMan, but I can't figure out how to upload the actual file to swagger)
 *       - application/json
 *     requestBody:
 *       content:
 *         application/octet-stream:
 *           schema:
 *             type: object
 *             properties:
 *             file:
 *               type: string
 *               format: binary
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
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
 *         description: Returns URL the file was uploaded to.
 *       404:
 *         description: Could not find specified project-id for user.
 *       500:
 *         description: Could not insert url into database.
 *       
 */
router.post("/:projectid/multerUpload", auth, verifyProjectExists, awsAdaptor.uploadMulter.single('userFile'), (req, res) => fileHandler.uploadFileMongo(req, res));


/**
 * @swagger
 * /files/{projectid}/delete:
 *   post:
 *     description: Deletes file wiuth supplied name from aws s3 server
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *       - in: path
 *         name: projectid
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: project id that the file belongs to
 *       - in: body
 *         name: user
 *         description: The file url to delete (from project attachments)
 *         schema:
 *           type: object
 *           required:
 *             - fileurl
 *           properties:
 *             filename:
 *               type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: File deleted successfully.
 *       400:
 *         description: validation error.
 *       404:
 *         description: Could not find specified project-id for user.
 *       500:
 *         description: Server error
 *       
 */
router.post("/:projectid/delete", auth, async (req, res) => fileHandler.deleteFile(req, res));


module.exports = router;
