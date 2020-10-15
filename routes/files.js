var express = require('express');

//Create router
var router = express.Router();

// middleware
const auth = require("../middleware/auth");
const verifyProjectExists = require("../middleware/verifyProjectExists");

const fileHandler = require("../controllers/files");
const awsAdaptor = require("../models/aws");

//Available routes
/**
 * @swagger
 * /files/{projectid}/upload:
 *   post:
 *     tags:
 *       - files
 *     description: Uploads incoming file to aws s3 server and attaches it to project. File comes in as binary data.
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
 *       - in: formData
 *         name: userFile
 *         required: true
 *         type: file
 *         description: The file to upload.
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
router.post("/:projectid/upload", auth, verifyProjectExists, awsAdaptor.uploadFile.single('userFile'), (req, res) => fileHandler.uploadFile(req, res));


/**
 * @swagger
 * /files/{projectid}/delete:
 *   post:
 *     tags:
 *       - files
 *     description: Deletes file with supplied url from aws s3 server
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
 *         name: fileurl
 *         description: The file url to delete (from project attachments)
 *         schema:
 *           type: object
 *           required:
 *             - fileurl
 *           properties:
 *             fileurl:
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




/**
 * @swagger
 * /files/{projectid}/uploadFromLocal:
 *   post:
 *     tags:
 *       - files
 *     deprecated: true
 *     description: Uploads specified file on local machine to aws s3 server and attaches it to project
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
router.post("/:projectid/uploadFromLocals", auth, async (req, res) => fileHandler.uploadFileFromLocal(req, res));

module.exports = router;
