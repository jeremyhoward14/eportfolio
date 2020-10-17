const Users = require('../models/users');

const getCircle = (req, res) => {
    Users.findOne({ username: req.params.id})
      .then(user => {
        if (user) {
          res.send(user.circle);
        } else {
          res.status(404).send("User not found.");
        }        
      })
};

const addCircle = async (req, res) => {
    //from the auth middleware, having jwt in header returns username
  
    //get user information from the username
    const user = await Users.findOne({ username: req.user.username});
    if(!user) return res.status(404).json({msg: 'Could not find username in database'});

    if(req.user.username == req.params.friend){
        return res.status(400).json({msg: 'You can\'t add yourself you silly goose!'});
    }

    for (const circ of user.circle){
        if(circ == req.params.friend){
            return res.status(400).json({msg: 'Friend is already part of your circle!'});
        }
    };

    await Users.findOne({ username: req.params.friend})
      .then(user2 => {
        if (user2) {
            user.circle.push(req.params.friend);
            user.save();

            res.send("You have added " + user2.username + " to your circle!");
        } else {
            return res.status(404).json({msg: 'Could not find username in database'});
        }        
      })
};
const removeCircle = async (req, res) => {
    //from the auth middleware, having jwt in header returns username
  
    //get user information from the username
    const user = await Users.findOne({ username: req.user.username});
    if(!user) return res.status(404).json({msg: 'Could not find username in database'});

    //https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array
    const index = user.circle.indexOf(req.params.friend);
    if(index > -1){
        user.circle.splice(index, 1);
        user.save()
        res.send("Successfully removed " + req.params.friend + " from your circle!");
    }else{
        return res.status(404).json({msg: 'Could not find username in your circle'});
    }
};
module.exports = {
    addCircle,
    removeCircle,
    getCircle
}