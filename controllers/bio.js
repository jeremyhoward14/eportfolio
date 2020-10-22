const Users = require("../models/users");

const getBio = async (req, res) => {
    const user = await Users.findOne({ username: req.params.username});

    if (user) {  //Username found
        res.send(user.bio);
    } else {
        res.status(404).json({msg: 'Could not find username in database.'});
    }
}

const updateBio = async (req, res) => {
    //from the auth middleware, having jwt in header returns username

    //get user information from the username
    const user = await Users.findOne({ username: req.user.username});
    if (!user) {
        return res.status(404).json({msg: 'Could not find username in the database.'});
    }

    user.bio.text = req.body.bio;
    user.save();
    return res.status(200).json({msg: 'bio updated successfully.'});
}

module.exports = {
    getBio,
    updateBio
}