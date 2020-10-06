const Users = require('../models/users');

const createProject = async (req, res) => {
    var username = req.user.username; // from jwt
    var title = req.body.title;
    var text = req.body.text;
    var tags = req.body.tags;

    var newProject = {
        title: title,
        text: text,
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

const editProject = async (req, res) => {
    //from the auth middleware, having jwt in header returns username
  
    //get user information from the username
    const user = await Users.findOne({ username: req.user.username});
    if(!user) return res.status(400).json({msg: 'Could not find username in database'});
  
    //loop through all projects, find specific project based off project-id
    try{
    for (const project of user.projects){
      if(project.title == req.params.id){
  
        if(req.body.title != null){       // renaming, changes the primary key
          project.title = req.body.title;
        }
        if(req.body.text != null){
          project.text = req.body.text;
        }  
        if(req.body.attachments != null){     // TODO: should this be doable with this call?
          project.attachments = req.body.attachments;
        }  
        if(req.body.tags != null){
          project.tags = req.body.tags;
        }
  
        //save user to database
        user.save()
        return res.send(project);
      }
    };
    return res.status(400).json({msg: 'Could not find specified project-id for user'});
    }
    catch(err){
      return res.status(400).json({msg: 'Could not find specified project-id for user'});
    }
  
  };


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
    // deleteProject,
    editProject,
    loggedInUserProjects
}