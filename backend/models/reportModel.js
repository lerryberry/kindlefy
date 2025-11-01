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

// Indexes for common query patterns
reportSchema.index({ parentDecision: 1, isArchived: 1 });
reportSchema.index({ winningOptionId: 1, isArchived: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
