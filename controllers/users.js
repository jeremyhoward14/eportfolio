const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const passport = require('passport');

const {registerValidation, loginValidation} = require('../validation');


const getAllUsers = (req, res) => {
    Users.find({}, (findErr, data) => {
      if (findErr) {
        res.status(500).send("Database error");
      } else {
        res.send(data);
      }
    });
  };


const registerUser = (req, res) => {
    const { username, email, password, firstname, lastname } = req.body;

    const {error} = registerValidation(req.body);
    if(error){
      return res.status(400).send(error.details[0].message);
    }

    //Check if user (email) already in database
    Users.findOne({ email})
      .then(user => {
        if(user) {
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
                  { id: user.id },
                  process.env.jwtSecret,
                  { expiresIn: 3600 },
                  (err, token) => {
                    if(err) throw err;
                      res.json({
                        token,
                        user: {
                          id: user.id,
                          username: user.name,
                          email:user.email,
                          firstname: user.firstname,
                          lastname: user.lastname
                        }
                      });
                  }
                )
              });
          })
        })
      })
}

const loginUser = async (req, res) => {

  const{error} = loginValidation(req.body);
  if(error){
    return res.status(400).send(error.details[0].message);
  }
  const user = await Users.findOne({ email: req.body.email});
  if(!user) return res.status(400).send('Email does not exist');

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if(!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({id: user.id}, process.env.jwtSecret, { expiresIn: 3600});

  try{
  //res.header('auth-token', token).send(token);
  res.json({
    token,
    id: user.id
  });
  }
  catch (e) { throw e};
  //res.send('Logged in!')

};

const logOutUser = (req, res) => {
  //req.logOut();
  res.redirect('/docs');
  //return res.status(200).json({ msg: 'User logged out'});
}
module.exports = {
    getAllUsers,
    registerUser,
    loginUser,
    logOutUser
};