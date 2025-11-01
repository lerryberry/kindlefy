const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rankingSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    criterionId: {
        type: Schema.Types.ObjectId,
        ref: 'Criteria',
        required: true
    },
    optionId: {
        type: Schema.Types.ObjectId,
        ref: 'Options',
        required: true
    },
    matchLevel: {
        type: String,
        enum: {
            values: ['BEST_CHOICE', 'IMPARTIAL', 'WORST_CHOICE']
        }
    },
    rank: {
        type: Number,
        required: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
        required: true,
    }
}, { timestamps: true })

// Indexes for common query patterns - CRITICAL for performance
rankingSchema.index({ optionId: 1, isArchived: 1 });
rankingSchema.index({ criterionId: 1, isArchived: 1 });
rankingSchema.index({ optionId: 1, criterionId: 1, isArchived: 1 });
rankingSchema.index({ createdAt: -1 });

const Ranking = mongoose.model('Ranking', rankingSchema)

module.exports = Ranking;