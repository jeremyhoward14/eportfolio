var express = require('express');

//Create router
var router = express.Router();
//Require user controller
const projectController = require("../controllers/projects");

/**
 * @swagger
 * /projects/create:
 *   post:
 *     description: Create a new project
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The project to create.
 *         schema:
 *           type: object
 *           required:
 *             - username
 *             - projectname
 *             - title
 *             - text
 *             - tags
 *           properties:
 *             projectname:
 *               type: string
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
router.post("/create", (req, res) => projectController.createProject(req, res));


router.post('/edit/:id', auth, async (req, res) => projectsController.editProject(req, res));

module.exports = router;
