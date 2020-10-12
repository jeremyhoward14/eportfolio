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

var awshandler = require("../models/aws");
/**
 * @swagger
 * /files/{projectid}/multerUpload:
 *   post:
 *     description: Uploads incoming file to aws s3 server and attaches it to project
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
router.post("/:projectid/multerUpload", auth, awshandler.uploadMulter.single('userFile'),
    (req, res, next) => {
        res.json({msg: "uploaded file to " + req.file.location}).status(200);
        // at this point, upload to mongo
    }
);
// route plan:
//router.post("/:projectid/multerUpload", auth, projectVerifier, <awshandler. or middleware>uploadMulter.single('userFile'), <fileHandler or projectHandler>.addFile(req, res));

// I BELIEVE THE CLIENT __MUST__ MATCH `.single('userFile')` WITH SOMETHING LIKE:
// var theinput = document.getElementById('myfileinput')
// var data = new FormData()
// data.append('myfile',theinput.files[0])
// fetch( "/upload", { method:"POST", body:data } )
// https://stackoverflow.com/questions/31530200/node-multer-unexpected-field


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
