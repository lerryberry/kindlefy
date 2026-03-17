const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    externalId: {
        type: String,
        required: [true, 'A user must have an external ID'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: [true, 'A user must have a name']
    },
    profilePic: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema)

module.exports = User;