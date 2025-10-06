const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new mongoose.Schema({
    parentDecision: {
        type: Schema.Types.ObjectId,
        ref: 'Decision',
        required: true
    },
    winningOptionId: {
        type: Schema.Types.ObjectId,
        ref: 'Options',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isArchived: {
        type: Boolean,
        default: false,
        required: true
    }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
