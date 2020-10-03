const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
    },
    projects: [{
        title: String, 
        text: String,
        tags: [{
            tag: String,
        }],
        attachments: [{
            url: String,
        }],
    }],
});

module.exports = mongoose.model('User', userSchema)