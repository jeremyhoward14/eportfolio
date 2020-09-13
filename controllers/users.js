const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const passport = require('passport');

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

    if(!username || !email || !password || !firstname || !lastname){
        return res.status(400).json({ msg: 'hello'});
    }

    Users.findOne({ email})
      .then(user => {
        if(user) {
          return res.status(400).json({ msg: 'User already exists'});
        }

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

const loginUser = (req, res) => {

  passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);

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