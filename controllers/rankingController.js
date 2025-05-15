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

    //validate the criterion and options are all from the same decision and the criterion is not archived
    const isChildCriterion = await Criteria.countDocuments({ _id: criterionId, parentDecision: decisionId, isArchived: false});
    if (isChildCriterion === 0) {
        return next(new AppError(`Criterion does not belong to the decision or its archived`, 404));
    }

    //validate the options are all from the same decision
    const validateOptions = rankingsArray.map(async (rank) => {
        const isChild = await Option.countDocuments({ _id: rank.optionId, parentDecision: decisionId });
        return isChild 
    });
    const results = await Promise.all(validateOptions);
    if (results.includes(0)){
        return next(new AppError(`One or more options do not belong to the decision`, 404));
    }

    //validate none of the options are archived
    const validateArchivedOptions = rankingsArray.map(async (rank) => {
        const isArchived = await Option.countDocuments({ _id: rank.optionId, isArchived: true });
        return isArchived 
    });
    const archivedResults = await Promise.all(validateArchivedOptions);
    if (archivedResults.includes(1)){
        return next(new AppError(`One or more options are archived`, 404));
    }

    const rankingsToInsert = rankingsArray.map((rank) => ({
        ...rank, 
        criterionId: criterionId,
        userId: userId
    }));

    const insertedRankings = await Ranking.insertMany(rankingsToInsert, {
        ordered: true, // Set to true for all-or-nothing insertion
        runValidators: true,
    });

    res.status(201).json({
        status: 'success',
        results: insertedRankings.length, 
        data: insertedRankings
    });
})

