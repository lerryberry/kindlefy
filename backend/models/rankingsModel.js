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
            values: ['BEST', 'IMPARTIAL', 'WORST']
        }
    },
    rank : {
        type: Number,
        required: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
        required: true,
    }
 }, { timestamps: true })

const Ranking = mongoose.model('Ranking', rankingSchema)

module.exports = Ranking;