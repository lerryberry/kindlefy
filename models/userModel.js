const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    externalId: {
        type: String,
        unique: true,
        lowercase: true
    },
    displayName: {
        type: String,
        required: [true, 'Name field is required'],
        minlength: [2, 'A name must be at least 2 characters'],
        maxlength: [100, 'A name must be less than 100 characters']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    profilePic: String
}, {timestamps: true});

const User = mongoose.model('User', userSchema)

module.exports = User;