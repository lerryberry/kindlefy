const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Criteria = require('../models/criteriaModel')
const Ranking = require('../models/rankingsModel')
const Options = require('../models/optionsModel');

exports.updateCriterion = factory.updateOne(Criteria);
exports.addCriterion = factory.addOne(Criteria);
exports.addManyCriterias = factory.addMany(Criteria);
exports.getCriterion = factory.getOne(Criteria);
exports.validateChildCriterion = factory.validateChild(Criteria);

exports.deleteCriterion = catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const id = req.params.id;

    // Archive the criterion
    const criterion = await Criteria.findOneAndUpdate(
        { _id: id, parentDecision: decisionId },
        { isArchived: true },
        { new: true, runValidators: true }
    );

    if (!criterion) {
        return next(new AppError(`no criterion found with that id`, 404));
    }

    // Archive all rankings associated with this criterion
    await Ranking.updateMany(
        { criterionId: id },
        { isArchived: true },
        { new: true, runValidators: true }
    );

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.updateManyCriterias = catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const criteriaArray = req.body;

    // Validate that input is an array
    if (!Array.isArray(criteriaArray)) {
        return next(new AppError(`Array of criterion objects is required`, 400));
    }

    if (criteriaArray.length === 0) {
        return next(new AppError(`Array must not be empty`, 400));
    }

    // Validate all criteria belong to the decision and are not archived
    const criteriaIds = criteriaArray.map(criterion => criterion.criterionId);
    const existingCriteria = await Criteria.find({
        _id: { $in: criteriaIds },
        parentDecision: decisionId,
        isArchived: false
    });

    if (existingCriteria.length !== criteriaIds.length) {
        return next(new AppError(`One or more criteria do not belong to the decision or are archived`, 404));
    }

    // Update criteria in batch
    const updatePromises = criteriaArray.map(criterion =>
        Criteria.findByIdAndUpdate(
            criterion.criterionId,
            {
                priority: criterion.priority,
                globalRank: criterion.ranking || criterion.globalRank || 1
            },
            { new: true, runValidators: true }
        )
    );

    const updatedCriteria = await Promise.all(updatePromises);

    res.status(200).json({
        status: 'success',
        results: updatedCriteria.length,
        data: updatedCriteria
    });
});

exports.getAllCriteria = catchAsync(async (req, res) => {
    //set pagination filters
    const count = await Criteria.countDocuments();
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || count;
    const skip = (page - 1) * limit;
    const lastPage = (count <= (skip + limit)) ? true : false;

    //validate that the child is of the parents decision, and only do that for child documents
    const query = req.params.decisionId ? { parentDecision: { $in: req.params.decisionId }, isArchived: false } : { 'accessControl.userId': req.userId, isArchived: false };

    //apply paginations filters
    const allCriteria = await Criteria.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

    // loop through all criteria and determine whether the criterion was ranked or not, i.e. criterion status
    output = await Promise.all(
        allCriteria.map(async (data) => {
            const isRanked = await getCriterionStatus(data._id, req.params.decisionId);
            data._doc.isRanked = isRanked;
            return data
        })
    );

    res.status(200).json({
        status: "success",
        results: output.length,
        output,
        lastPage: lastPage
    });
})


const getCriterionStatus = async (criteriaId, decisionId) => {

    // count all active options that belong to the decision
    const optionsCount = await Options.countDocuments({ parentDecision: decisionId, isArchived: false });

    //count all active rankings that belong to the criterion for active options only
    const distinctRankedOptionsCount = (await Ranking.distinct('optionId', {
        criterionId: criteriaId,
        isArchived: false
    })).length;

    //check if all the active options have been ranked 
    const isRanked = optionsCount === distinctRankedOptionsCount ? true : false;
    return isRanked
}