var express = require('express');

//Create router
var router = express.Router();
//Require user controller
const projectController = require("../controllers/projects");

const auth = require('../middleware/auth')

/**
 * @swagger
 * /projects:
 *   get:
 *     tags:
 *       - projects
 *     description: Returns all projects in the database.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array containing all projects in the database
 *       500:
 *         description: Cannot connect to database.
 */
router.get("/", (req, res) => projectController.getAllProjects(req, res));


/**
 * @swagger
 * /projects/create:
 *   post:
 *     tags:
 *       - projects
 *     description: Create a new project for the logged in user
 *     consumes:
 *       - application/json
 *     parameters:
*       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *       - in: body
 *         name: project
 *         description: The project to create.
 *         schema:
 *           type: object
 *           required:
 *             - title
 *             - text
 *             - tags
 *           properties:
 *             title:
 *               type: string
 *             text:
 *               type: string
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Created new project and inserted into database.
 *       400:
 *         description: There is already a project with that name belonging to the user.
 *       404:
 *         description: Cannot create project as user does not exist.
 *       500:
 *         description: server error.
 *       
 */
router.post("/create", auth, (req, res) => projectController.createProject(req, res));

/**
 * @swagger
 * /projects/edit/{title}:
 *   post:
 *     tags:
 *       - projects
 *     description: Update a project. Each field in the body is not required so
 *       can update single or multiple fields at a time. Doesn't allow for the 
 *       changing of the title to one that is already used by another project of
 *       the user, as title is the primary key.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: title of project
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *       - in: body
 *         name: project
 *         description: The project data to edit.
 *         schema:
 *           type: object
 *           required:
 *             - projectname
 *             - title
 *             - text
 *             - tags
 *           properties:
 *             title:
 *               type: string
 *             text:
 *               type: string
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated project for user
 *       400:
 *         description: Could not find specified project-id for user
 *       500:
 *         description: server error.
 *       
 */
router.post('/edit/:id', auth, async (req, res) => projectController.editProject(req, res));


/**
 * @swagger
 * /projects/delete/{title}:
 *   post:
 *     tags:
 *       - projects
 *     description: Delete a project and all of its attachments
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: title of project
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully deleted project.
 *       404:
 *         description: Could not find specified project-id for user.
 *       
 */
router.post("/delete/:id", auth, (req, res) => projectController.deleteProject(req.user, req.params.title, (ret) => {
        res.status(ret.code).json({msg:ret.msg});
    })
);


/**
 * @swagger
 * /projects/user:
 *   get:
 *     tags:
 *       - projects
 *     description: List all of the projects belonging to the logged in user.
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: x-auth-token
 *         required: true
 *         type: string
 *         minimum: 1
 *         description: jwt
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: user's projects
 *       500:
 *         description: server error.
 *       
 */
router.get('/user', auth, async (req, res) => projectController.loggedInUserProjects(req, res));

module.exports = router;
