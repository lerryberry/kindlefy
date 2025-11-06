const mongoose = require('mongoose');
const axios = require('axios');

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
    preferences: {
        aiSuggestions: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema)

module.exports = User;