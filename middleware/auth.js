const jwt = require('jsonwebtoken');

function auth(req, res, next){

    console.log("hello");
    const token = req.header('x-auth-token');

    //check for token
    if(!token){
        res.status(401).json({ msg: 'No token, authorization denied'});
    }

    try{
        //verify token
        const decoded = jwt.veryify(token, process.env.jwtSecret);
        //Add user from payload
        req.user = decoded;
        console.log('worked');
        next();
    }catch(e){
        res.status(400).json({msg: 'Token is not valid'});
    }
}

module.exports = auth;