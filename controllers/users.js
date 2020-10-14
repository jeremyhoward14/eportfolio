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


module.exports = {
    getAllUsers,
    getOneUser,
    registerUser,
    loginUser,
};