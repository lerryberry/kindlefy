const factory = require('./handlerFactory.js');
const Option = require('../models/optionsModel.js')
const Ranking = require('../models/rankingsModel.js');
const Report = require('../models/reportModel.js');
const Criteria = require('../models/criteriaModel.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const mongoose = require('mongoose');
const { getCompletion } = require('../utils/openai');

exports.updateOption = factory.updateOne(Option);
exports.getAllOptions = factory.getAll(Option);
exports.addManyOptions = factory.addMany(Option);
exports.getOption = factory.getOne(Option);
exports.validateChildOption = factory.validateChild(Option);

exports.generateAIOptionsForDecision = async (decision, userPreferences) => {
    if (!decision || !userPreferences?.aiSuggestions) {
        return [];
    }

    if (decision.category === 'STAFF') {
        return [];
    }

    const existingOptionsCount = await Option.countDocuments({
        parentDecision: decision._id,
        isArchived: false
    });

    if (existingOptionsCount > 0) {
        return [];
    }

    const suggestionsNeeded = 3;

    const criteria = await Criteria.find({
        parentDecision: decision._id,
        isArchived: false
    }).select('title');

    const criteriaText = criteria.length > 0
        ? criteria.map(c => `- ${c.title}`).join('\n')
        : 'No criteria have been added yet.';

    const prompt = `You are helping someone make a decision. 

Decision Title: ${decision.title}
Decision Type: ${decision.category || 'GENERIC'}

Criteria so far:
${criteriaText}

Please suggest ${suggestionsNeeded} distinct options (choices/alternatives) that someone should consider for this decision. Each option should be concise (a few words) and actionable.

Return ONLY a JSON array of strings, where each string is an option title. Do not include any other text, explanations, or formatting. Example format:
["option 1", "option 2", "option 3"]`;

    try {
        const aiResponse = await getCompletion(prompt, {
            model: 'gpt-4o-mini',
            temperature: 0.7,
            max_tokens: 200
        });

        let suggestedOptionTitles = [];
        try {
            const jsonMatch = aiResponse.match(/\[.*\]/s);
            if (jsonMatch) {
                suggestedOptionTitles = JSON.parse(jsonMatch[0]);
            } else {
                suggestedOptionTitles = JSON.parse(aiResponse);
            }
        } catch (parseError) {
            const lines = aiResponse.split('\n').filter(line => line.trim());
            suggestedOptionTitles = lines
                .map(line => line.replace(/^[-*•]\s*/, '').replace(/"/g, '').trim())
                .filter(line => line.length > 0)
                .slice(0, suggestionsNeeded);
        }

        if (!Array.isArray(suggestedOptionTitles)) {
            suggestedOptionTitles = [];
        }

        suggestedOptionTitles = suggestedOptionTitles
            .map(title => title.trim())
            .filter(title => title.length > 0)
            .slice(0, suggestionsNeeded);

        if (suggestedOptionTitles.length === 0) {
            return [];
        }

        const documentsToCreate = suggestedOptionTitles.map((title) => ({
            title,
            parentDecision: decision._id
        }));

        const createdOptions = await Promise.all(
            documentsToCreate.map(doc => Option.create(doc))
        );

        return createdOptions;
    } catch (error) {
        console.error('Error generating AI option suggestions:', error.message);
        return [];
    }
};

exports.deleteOption = catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const id = req.params.id;

    // Check if this option is referenced in any active reports
    const activeReports = await Report.find({
        winningOptionId: id,
        isArchived: false
    });

    if (activeReports.length > 0) {
        return next(new AppError(`Cannot delete option while it is selected as the winner of a decision`, 400));
    }

    const option = await Option.updateMany({ _id: id, parentDecision: decisionId }, { isArchived: true }, {
        new: true,
        runValidators: true
    });

    if (!option) {
        return next(new AppError(`no document found with that id`, 404))
    }

    // Archive all rankings associated with the option
    const rankings = await Ranking.updateMany({ optionId: id }, { isArchived: true }, {
        new: true,
        runValidators: true
    });

    res.status(204).json({
        status: "success",
        data: null
    });
})

// The getRankedOption function is used for the single criterion view of the options. It shows the user the current ranking of options against that criterion, so they can resort them accordingly.
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
                                        { $eq: ['$optionId', '$$option_id_from_option_doc'] },
                                        // Use the correct field name from the Ranking schema ('criterionId')
                                        { $eq: ['$criterionId', criterionObjectId] }
                                    ]
                                }
                            }
                        },
                        // Sort by createdAt in descending order to get the newest ranking
                        { $sort: { createdAt: -1 } },
                        // Limit to 1 to get only the newest ranking per option/criteria combo
                        { $limit: 1 },
                        // Optional: Project only the category field needed
                        { $project: { matchLevel: 1, rank: 1, _id: 0 } } // Retrieve the 'category' field
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
                    matchLevel: '$matchedRankingDoc.matchLevel', // Access the nested 'category' field
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
                    matchLevel: 1,
                }
            }
        ]);
        return optionsWithCategory;
    }

    const data = await getAllRankedOptions(decisionId, criteriaId);

    res.status(200).json({
        status: 'success',
        results: data.length,
        data
    });
});