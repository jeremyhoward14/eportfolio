const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const {registerValidation, loginValidation} = require('../validation');
const { collection } = require("../models/users");


const getAllUsers = (req, res) => {
    Users.find({}, (findErr, data) => {
      if (findErr) {
        res.status(500).send("Database error");
      } else {
        res.send(data);
      }
    });
};


const getOneUser = (req, res) => {
    Users.findOne({ username: req.params.id})
      .then(user => {
        if (user) {
          res.send(user);
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
  catch (e) { throw e};
  //res.send('Logged in!')

};


/* 
 * update the attachments for a given user and add the given url
 * res:
 *  - username: user uploading
 *  - projectTitle: title of the project
 *  - url: the newly added link
 * 
 * https://docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/embedded-arrays
 */
const addUserAttachments = (req, res) => {
  // var query = { username: req.body.username, "projects.title": req.body.projectTitle};
  // var updateDocument = {
  //   $set: {"projects.$.attachments": null /* fuck this */ }
  // }
  // var result = await collection.updateOne(query, updateDocument);

  var query = { username: req.body.username };

  var updateDocument = {
    $push: {"projects.$[project].attachments": req.body.url}  // maybe addToSet should be used instead?
  };

  // choose only the array matching the desired project
  var options = {
    arrayFilters: [{
      "project.title" : req.body.projectTitle
    }]
  }
  var result = await Users.collection.updateOne(query, updateDocument, options);

  //res.send(200) ?
};


/* 
 * update the attachments for a given user and delete the given url
 * res:
 *  - username: user uploading
 *  - projectTitle: title of the project
 *  - url: the newly added link
 * 
 * https://docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/embedded-arrays
 */
const removeUserAttachments = (req, res) => {
  var query = { username: req.body.username };

  var updateDocument = {
    $pull: {"projects.$[project].attachments": req.body.url}    // this could work but I have no idea
  };

  // choose only the array matching the desired project
  var options = {
    arrayFilters: [{
      "project.title" : req.body.projectTitle
    }]
  }
  var result = await Users.collection.updateOne(query, updateDocument, options);

  // OR

  // https://stackoverflow.com/questions/55738068/remove-element-in-array-by-value-mongodb-nodejs
  //  but I think that deletes the attachments array or something?
  // Users.collection.updateOne(
  //   { username: req.body.username }, 
  //   { $pull: 
  //     { projects: 
  //       { attachments: req.body.url }
  //     }
  //   }
  // );

  //res.send(200) ?
};


module.exports = {
    getAllUsers,
    getOneUser,
    registerUser,
    loginUser,
    addUserAttachments,
    removeUserAttachments,
};