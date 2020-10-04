const Users = require('../models/users');

const createProject = async (req, res) => {
    var username = req.body.username;
    var projectname = req.body.projectname;
    var title = req.body.title;
    var text = req.body.text;
    var tags = req.body.tags;

    var newProject = {
        projectname: projectname,
        title: title,
        text: text,
        tags: tags
    }

    // first, check if the user exists
    const userExistsErr = await Users.findOne({username})
        .then(user => {
            if (user == null) {
                return res.status(404).send('Cannot create project as user does not exist.');
            }
        },
        user => {return user;} )

    if (userExistsErr) { return userExistsErr; }

    // see if the user has a project by that [[NAME]]??, or are we using some other kind of id??

    /* ************** THIS BIT DOESN'T WORK ************** */
    const projExistsErr = await Users.collection.findOne(
        // {"projects": {
        //     $elemMatch: {
        //         "projectname": projectname
        //     }
        // }}
        {"username": username, "projects.name": { "$in": [projectname]} }
    )    
    .then(user => {
        if (user == null) {
            res.send("There is already a project with that name belonging to the user.");
            // res.sendStatus(404);
            return;
        }
    })
    .catch(user => {console.log(user);});
    if (projExistsErr) { return projExistsErr; }

    /* ************** IT WORKS FROM HERE ************** */

    // insert this project into DB
    Users.collection.findOneAndUpdate(
        { username: username },
        { $push: {project: newProject } },
        (err, success) => {
            if (err) { 
                console.log(err);
                // res.sendStatus(500).send("Database error: Cannot create project.");
                return
            } else {
                console.log("\n\033[31mSuccess\033[0m\n");
                console.log(success);
                // res.sendStatus(201).send("Created new project and inserted into database.");
                return
            }
        }
    )

    // raise this error while I figure out why there's an error having res.send previously
    res.sendStatus(501);
};

module.exports = {
    createProject,
    // deleteProject,
    // editProject
}