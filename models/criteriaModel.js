const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const criteriaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A criterion must have a title'],
        minlength: [10, 'A criterion title must have more than 9 characters'],
        maxlength: [201, 'A criterion title must be 200 character or less']
    },
    parentDecision: {
        type: Schema.Types.ObjectId, 
        ref: 'Decision', 
        required: true 
    },
    description: {
        type: String,
        minlength: [10, 'A criterion description must have more than 9 characters'],
        maxlength: [1001, 'A criterion title must be 1000 character or less']
    },
    priority: {
        type: String,
        default: "MUST_HAVE",
        enum: {
            values: ['MUST_HAVE', 'SHOULD_HAVE', 'COULD_HAVE'],
            message: "must be MUST_HAVE, SHOULD HAVE, or COULD HAVE"
        },
        required: true,
    },
    status: {
        type: String,
        enum: {
            values: ['UNSORTED', 'SORTED'],
            message: "Must be SORTED or UNSORTED"
        },
        default: "UNSORTED"
    }
 }, { timestamps: true })

const Criteria = mongoose.model('Criteria', criteriaSchema)

module.exports = Criteria;