const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const authUser = (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({ msg: 'hello'});
    }

    Users.findOne({ email})
      .then(user => {
        if(!user) {
          return res.status(400).json({ msg: 'User does not exist'});
        }

        bcrypt.compare(password, user.password)
            .then(isMatch => {
                if(!isMatch) return res.status(400).json({msg: 'Invalid credentials'});

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
            })
      })
}
module.exports = {
    authUser
};