const Users = require('../models/users');
const FileHandler = require("../controllers/files");

const createProject = async (req, res) => {
    var username = req.user.username; // from jwt
    var title = req.body.title;
    var text = req.body.text;
    var tags = req.body.tags;

    // constraint on project naming, must be >= 3 chars
    if (title.length <= 3) {
        return res.status(400).json({msg:"project name must be >= 3 characters"});
    }

    var newProject = {
        title: title,
        text: text,
        attachments: [],  // new project has no attachments
        tags: tags
    }

    // first, check if the user exists: this shouldn't happen though as we are getting the username from the jwt
    const userExistsErr = await Users.findOne({username})
        .then(user => {
            if (user == null) {
                return res.status(404).json({msg:"Cannot create project as user does not exist."});
            }
        },
        user => {return user;} )
    if (userExistsErr) { return userExistsErr; }

    // see if the user has a project by that title, unless we want to use some other kind of id?
    const projExistsErr = await Users.collection.findOne(
        // {"projects": {
        //     $elemMatch: {
        //         "title": title
        //     }
        // }}
        {"username": username, "projects.title": { "$in": [title]} }
    )    
    .then(user => {
        if (user) {
            return res.status(400).json( {msg:"There is already a project with that name belonging to the user."} );
        }
    })
    .catch(user => {console.log(user);});
    if (projExistsErr) { return projExistsErr; }


    // insert this project into DB
    Users.collection.findOneAndUpdate(
        { username: username },
        { $push: {projects: newProject } },
        (err, success) => {
            if (err) { 
                return res.json({msg:"Database error: Cannot create project."}).status(500);
            } else {
                // console.log("\n\033[31mSuccessfully created project:\033[0m");
                // console.log(success);
                // console.log(newProject);
                return res.status(201).json( {msg:"Created new project and inserted into database."});
            }
        }
    )
};

/*
 * edit a user project. Does not allow for the changing of the title to one that
 * is already used by another project of the user, as title is the primary key.
 */
const editProject = async (req, res) => {
  //from the auth middleware, having jwt in header returns username

  //get user information from the username
  const user = await Users.findOne({ username: req.user.username});
  if(!user) return res.status(400).json({msg: 'Could not find username in database'});

  //loop through all projects, find specific project based off project-id
  try{
    for (const project of user.projects){
      if(project.title == req.params.id){
  
        if(req.body.title != null){
          // ensure that no other project has this title, or else we would get clashing PKs
          // await because we want to check this one first
          const search = await Users.findOne({"username": req.user.username, "projects.title": { "$in": [req.body.title]} })
          if (search) {
            return res.status(400).json({msg: "Cannot update project, as another project already has this title."});
          } else {
            project.title = req.body.title;
          }
        }
        if(req.body.text != null){
          project.text = req.body.text;
        }
        if(req.body.tags != null){
          project.tags = req.body.tags;
        }
  
        //save user to database
        user.save()
        return res.status(200).send(project);
      }
    };
    return res.status(400).json({msg: 'Could not find specified project-id for user'});
    
  } catch(err){
    return res.status(400).json({msg: 'Could not find specified project-id for user'});
  }
};


const deleteProject = async (req, res) => {
    var username = req.user.username; // from jwt
    var title = req.params.id

    // see if the user has a project by that title
    const search = await Users.findOne({"username": username, "projects.title": { "$in": [title]} })
    if (search) {     // remove it     
        FileHandler.deleteProjectFiles(username, title, (err) => {
          if (err) {
            return res.status(500).json({msg: "could not delete project files"});
          } else {
            search.projects = search.projects.filter( el => el.title !== title);
            search.save()
            return res.status(200).json( {msg: 'Successfully deleted project.'} );
          }
        })

    } else {
        // project does not exist
        return res.status(404).json( {msg: 'Could not find specified project-id for user.'} ); // we know the user should exist because it was passed in from jwt
    }
};

/* get every project in the database 
   - tested with users with no projects and differing lengths 
 */
const getAllProjects = async (req, res) => {
  Users.find({})
  .then( users => {
    /* this bit does a list comprehension
     * `[].concat.apply([], listcomp)` and `listcomp.flat()` both turn an array of arrays into one
     * flat is neater but apparently it's newer, is that a concern?
     * https://stackoverflow.com/a/10865042
     * edit: after some benchmarking, the concat function seems faster with random strings
     */
    // return res.status(200).send(
    //   users.map( user => {
    //     return user.projects;
    //   }).flat(1))
    var listcomp = users.map(user => {return user.projects;});
    return res.status(200).send( [].concat.apply([], listcomp) );
  })
  .catch( err => {
    return res.status(500).json({msg: "Cannot connect to database."})
  });
}

/* view all projects of a logged in user */
const loggedInUserProjects = async (req, res) => {
  const user = await Users.findOne({ username: req.user.username});

  if (!user) { // this looks for the logged in user, so it should always exist
    return res.status(500).json({msg: 'database error: could not find user'});
  }
  return res.status(200).json(user.projects);
}

module.exports = {
    createProject,
    deleteProject,
    editProject,
    getAllProjects,
    loggedInUserProjects
}