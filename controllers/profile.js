const Users = require("../models/users");

// get a single user by username
const getOneUser = async (req, res) => {
    var userNotFoundError;

    const user = await Users.findOne({ _id: req.params.id}).catch(err => { userNotFoundError = err});

    if(userNotFoundError || !user){
        return res.status(400).send('User does not exist');
    }
    return res.status(200).send(user);
};
module.exports = {
    getOneUser
};