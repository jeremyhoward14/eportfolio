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
        select: false,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    circle: [String],
    bio: {
        type: String,
        socials: [String],
        category: {
            type: String,
            enum: ['JOB_SEARCHER', 'RECRUITER'],
            default: 'JOB_SEARCHER',
        },
        picture: String,
    },
    projects: [{
        title: String, 
        text: String,
        tags: [String],
        attachments: [{
            url: String,
        }],
    }],
});

module.exports = mongoose.model('User', userSchema)