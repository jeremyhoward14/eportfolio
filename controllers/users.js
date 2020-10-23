const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const {registerValidation, loginValidation} = require('../validation');
const { collection } = require("../models/users");
const projectController = require("../controllers/projects");
const fileController = require("../controllers/files")


const getAllUsers = (req, res) => {
    Users.find({}, (findErr, data) => {
      if (findErr) {
        res.status(500).send("Database error");
      } else {
        // list comprehension to scrub passwords
        var listcomp = data.map(user => {
          return getPublicUserObject(user);
        });
        res.send([].concat.apply([], listcomp));
      }
    });
};


const getOneUser = (req, res) => {
    Users.findOne({ username: req.params.id})
      .then(user => {
        if (user) {
          res.send(getPublicUserObject(user));
        } else {
          res.status(404).send("User not found.");
        }        
      })
};

const registerUser = async (req, res) => {
    const { username, email, password, firstname, lastname } = req.body;

    const {error} = registerValidation(req.body);
    if(error){
      return res.status(400).json({msg: error.details[0].message});
    }
    
    //Check if username already in database
    const err = await Users.findOne({ username})
      .then(user => {
        if (user) {
          return res.status(400).json({ msg: 'Username already exists'});
        }        
      })
    if(err){
      return err;
    }
    //Check if email already in database
    Users.findOne({ email })
      .then(user => {
        if (user) {
          return res.status(400).json({ msg: 'Email already exists'});
        }
        
        //else create new user
        const newUser = new Users({
          username,
          email,
          password,
          firstname,
          lastname
        });

        //create hashed password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {

                jwt.sign(
                  { username: user.username },
                  process.env.jwtSecret,
                  { expiresIn: 3600 },
                  (err, token) => {
                    if(err) throw err;
                      res.json({
                        token,
                        user: {
                          id: user.id,
                          username: user.username,
                          email:user.email,
                          firstname: user.firstname,
                          lastname: user.lastname,
                          projects: user.projects
                        }
                      });
                  }
                )
              })
          })
        })
      })
};

const loginUser = async (req, res) => {

  const{error} = loginValidation(req.body);
  if(error){
    return res.status(400).json({msg: error.details[0].message});
  }
  const user = await Users.findOne({ email: req.body.email});
  if(!user) return res.status(400).json({msg: 'Email or Password is incorrect'});

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if(!validPass) return res.status(400).json({msg: 'Email or Password is incorrect'});

  const token = jwt.sign({username: user.username}, process.env.jwtSecret, { expiresIn: 3600});

  try{
  //res.header('auth-token', token).send(token);
  res.json({
    token,
    user: getPublicUserObject(user)
  });
  }
  catch (e) { throw e};
  //res.send('Logged in!')

};

const getPublicUserObject = (user) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    circle: user.circle,
    picture: user.picture,
    bio: user.bio,
    projects: user.projects
  };
}


/* delete the logged in user, takes in JWT via auth */
const deleteUser = async (req, res) => {
  const user = await Users.findOne({username: req.user.username});
  if (user == null) {
    // user should have been found as it came from jwt, but worth checking
    return res.status(500).json("Server error: could not find user.");
  } else {
    // delete the user from other users' circles
    deleteUserFromCircles(user.username, (err, data) => {
      if (err) {
        return res.status(500).json({msg:"server error"});
      } else {
        
        // delete the DP from AWS
        fileController.deleteDP(user.picture, (err) => {
          
          if (err) {
            return res.status(err.status).json({msg:err.msg});
          }

          // delete all attachments related to the user's projects
          // structure here relates to: https://stackoverflow.com/a/21185103
          var numProjects = user.projects.length;
          if (numProjects === 0) {
            deleteUserCleanup(req.user.username, res);
          } else {

            user.projects.forEach(p => {

              projectController.deleteProject(req.user, p.title, (ret) => {

                if (ret.code != 200) {
                  return res.status(ret.code).json({msg:ret.msg});
                }

                // deleted all projects, now remove user
                if (--numProjects === 0) {
                  deleteUserCleanup(req.user.username, res);
                }
              });
            })
          }
        })
      }
    })
  }
};

/* after removing from circles and deleting projects / dp, remove the user from mongo */
function deleteUserCleanup(username, res) {
  Users.collection.deleteOne({username: username})
  .then(result => {
    return res.status(200).json({msg: "sucessfully deleted user."});
  })
  .catch(result => {
    return res.status(500).json({msg: result});
  });
}

/*
 * find all of the users with this user in their circle and remove this user's name
 */
function deleteUserFromCircles(username, callback) {
  // query finds all users that have `username` in their circle
  var query = {"circle": { "$in": [username]}}
  var update = {$pull: {circle: username } }
  Users.updateMany(query, update, (err, data) => {callback(err, data)})
}


module.exports = {
    getAllUsers,
    getOneUser,
    registerUser,
    loginUser,
    deleteUser
};