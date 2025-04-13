const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const optionsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'An option must have a title'],
        minlength: [10, 'An option title must have more than 9 characters'],
        maxlength: [201, 'An option title must be 200 character or less']
    },
    parentDecision: {
        type: Schema.Types.ObjectId, 
        ref: 'Decision', 
        required: true 
    },
    description: {
        type: String,
        minlength: [10, 'An option description must have more than 9 characters'],
        maxlength: [1001, 'An option title must be 1000 character or less']
    }
 }, { timestamps: true })

const Options = mongoose.model('Options', optionsSchema)

module.exports = Options;