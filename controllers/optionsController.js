const factory = require('./handlerFactory');
const Option = require('./../models/optionsModel.js')
const catchAsync = require('./../utils/catchAsync');
const mongoose = require('mongoose');

exports.updateOption = factory.updateOne(Option);
exports.deleteOption = factory.archiveOne(Option);
exports.getAllOptions = factory.getAll(Option);
exports.addOption = factory.addOne(Option);
exports.getOption = factory.getOne(Option);
exports.validateChildOption = factory.validateChild(Option);

exports.getRankedOptions = catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId; 
    const criteriaId = req.params.id; 

    const getAllRankedOptions = async function (decisionId, criterionId) {
    
        const parentDecisionObjectId = new mongoose.Types.ObjectId(decisionId);
        const criterionObjectId = new mongoose.Types.ObjectId(criterionId); 
    
        const optionsWithCategory = await Option.aggregate([ 
        // Stage 1: Match Options belonging to the specified Decision
        {
            $match: {
            // Use the correct field name from the Option schema
                parentDecision: parentDecisionObjectId,
                isArchived: false, // Ensure we only consider non-archived options
            }
        },
        // Stage 2: Perform a LEFT OUTER JOIN with the 'rankings' collection using a pipeline
        {
            $lookup: {
            from: 'rankings', // The MongoDB collection name for Rankings
            let: { option_id_from_option_doc: '$_id' }, // Variable for the current Option's _id
            pipeline: [
                // Pipeline stages run on the 'rankings' collection for each Option
                {
                    $match: {
                        // Use $expr to compare fields from 'rankings' with the 'let' variable and external criterionId
                        $expr: {
                            $and: [
                                // Use the correct field name from the Ranking schema ('optionId')
                                { $eq: ['$option', '$$option_id_from_option_doc'] },
                                // Use the correct field name from the Ranking schema ('criterionId')
                                { $eq: ['$criterion', criterionObjectId] }
                            ]
                        }
                    }
                },
                // Optional: Limit to 1 if you expect only one ranking per option/criteria combo
                { $limit: 1 },
                // Optional: Project only the category field needed
                { $project: { category: 1, rank: 1, _id: 0 } } // Retrieve the 'category' field
            ],
            as: 'rankingInfo' // Output array field name
            }
        },
        // Stage 3: Extract the category from the potentially empty 'rankingInfo' array
        {
            $addFields: {
                // Get the first element (the ranking doc) or null if the array is empty
                matchedRankingDoc: { $arrayElemAt: ['$rankingInfo', 0] }
            }
        },
        {
            $addFields: {
                // Extract the 'category' field from the matchedRankingDoc, or null if no doc exists
                category: '$matchedRankingDoc.category', // Access the nested 'category' field
                rank: '$matchedRankingDoc.rank' // Access the nested 'rank' field
            }
        },
        // Stage 4: Sort by rank in ascending order
        {
            $sort: {
              rank: 1 
            }
        },
        // Stage 5: Project the final desired output shape
        {
            $project: {
                // Include desired fields from the Option model
                _id: 1,
                title: 1,
                rank: 1,
                category: 1,
            }
        }]);
        return optionsWithCategory;
    }

    const data = await getAllRankedOptions(decisionId, criteriaId);

    res.status(200).json({
        status: 'success',
        results: data.length,
        data
    });
});