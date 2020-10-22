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

    if (req.body.bio.length === 0) {
        return res.status(400).json({msg: 'Can not update to empty bio.'}); 
    }

    user.bio.text = req.body.bio;
    user.save();
    return res.status(200).json({msg: 'Bio updated successfully.'});
}

const updateName = async (req, res) => {
    //from the auth middleware, having jwt in header returns username

    //get user information from the username
    const user = await Users.findOne({ username: req.user.username});
    if (!user) {
        return res.status(404).json({msg: 'Could not find username in the database.'});
    }

    if (req.body.firstname.length === 0) {
        return res.status(400).json({msg: 'Failed. Firstname is an empty string.'}); 
    } else if (req.body.lastname.length === 0) {
        return res.status(400).json({msg: 'Failed. Lastname is an empty string.'});
    }

    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.save();
    return res.status(200).json({msg: 'Firstname and lastname updated successfully.'});
}

// dummy method until PR of profile pic upload/delete is approved
const deleteDP = (u,cb) => { cb(null,null) }

module.exports = {
    getBio,
    deleteDP,       // dummy
    updateBio,
    updateName
}