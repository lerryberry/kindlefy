const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rankingSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    criterion: {
        type: Schema.Types.ObjectId, 
        ref: 'Criteria', 
        required: true 
    },
    option: {
        type: Schema.Types.ObjectId,
        ref: 'Options', 
        required: true 
    },
    category: {
        type: String,
        enum: {
            values: ['BEST', 'IMPARTIAL', 'WORST']
        }
    },
    rank : {
        type: Number,
        required: true,
    }
 }, { timestamps: true })

const Ranking = mongoose.model('Ranking', rankingSchema)

Ranking.countRankings = async function (criterionId) {
    const criterionObjectId = new mongoose.Types.ObjectId(criterionId); 

    const rankingsCount = await Ranking.countDocuments({
        criterion: criterionObjectId
    });

    return rankingsCount;
}

module.exports = Ranking;