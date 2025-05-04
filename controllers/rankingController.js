const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError');
const Ranking = require('./../models/rankingsModel.js');
const Criteria = require('./../models/criteriaModel')
const Option = require('./../models/optionsModel.js')

exports.updateRanking = catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const criterionId = req.params.id;
    const userId = req.userId;
    const rankingsArray = req.body;

    //validate the criterion and options are all from the same decision
    const isChildCriterion = await Criteria.countDocuments({ _id: criterionId, parentDecision: decisionId });
    if (isChildCriterion === 0) {
        return next(new AppError(`Criterion does not belong to the decision`, 404));
    }

    //validate the options are all from the same decision
    const validateOptions = rankingsArray.map(async (rank) => {
        const isChild = await Option.countDocuments({ _id: rank.option, parentDecision: decisionId });
        return isChild 
    });

    const results = await Promise.all(validateOptions);

    if (results.includes(0)){
        return next(new AppError(`One or more options do not belong to the decision`, 404));
    }

    const rankingsToInsert = rankingsArray.map((rank) => ({
        ...rank, // Spread the data from the request body
        criterion: criterionId,
        userId: userId, 
    }));

    const insertedRankings = await Ranking.insertMany(rankingsToInsert, {
        ordered: true, // Optional: Set to true if you want all-or-nothing insertion
        runValidators: true,
    });

    // 5. Send Response
    res.status(201).json({
        // 201 Created
        status: 'success',
        results: insertedRankings.length, // Number actually inserted
        data: insertedRankings
    });
})

