const mongoose = require('mongoose');
const Decision = require('../models/decisionModel');
const Option = require('../models/optionsModel');
const Ranking = require('../models/rankingsModel');
const Criteria = require('../models/criteriaModel');
const Report = require('../models/reportModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.updateDecision = factory.updateOne(Decision);
exports.deleteDecision = factory.archiveOne(Decision);
exports.getAllDecisions = catchAsync(async (req, res, next) => {
    // Set pagination filters
    const count = await Decision.countDocuments({
        'accessControl.userId': req.userId,
        isArchived: false
    });
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || count;
    const skip = (page - 1) * limit;
    const lastPage = (count <= (skip + limit)) ? true : false;

    // Get decisions with pagination
    const decisions = await Decision.find({
        'accessControl.userId': req.userId,
        isArchived: false
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Add isDecided status to each decision
    const decisionsWithStatus = await Promise.all(
        decisions.map(async (decision) => {
            const decisionId = decision._id;

            // Check if there's an active report for this decision
            const activeReportCount = await Report.countDocuments({
                parentDecision: decisionId,
                isArchived: false
            });
            const isDecided = activeReportCount > 0;

            // Return decision with isDecided status
            return {
                ...decision.toObject(),
                isDecided
            };
        })
    );

    res.status(200).json({
        status: 'success',
        results: decisionsWithStatus.length,
        data: decisionsWithStatus,
        lastPage: lastPage
    });
});
exports.addDecision = factory.addOne(Decision);

exports.validateDecision = catchAsync(async (req, res, next) => {
    // make this function work for all routes, parent or child
    const id = req.params.decisionId ? req.params.decisionId : req.params.id;
    const decision = await Decision.find({ _id: id, 'accessControl.userId': req.userId })

    //validate the user has access to the decision
    const hasAccess = decision[0].accessControl[0].permissions.includes('READ' || 'UPDATE' || 'DELETE' || 'RANK')
    if (!hasAccess) {
        return next(new AppError(`authenticated user doesn't have access to that decision`, 404))
    }

    //validate the decision status an active one
    if (decision[0].isArchived) {
        return next(new AppError(`Decision is archived`, 404))
    }

    //valide that the decision belongs to the user
    if (decision.length === 0) {
        return next(new AppError(`authenticated user doesn't own that decision`, 404))
    }

    next();
})

exports.getDecision = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const data = await Decision.findOne({ _id: id });

    if (data.isArchived) {
        return next(new AppError(`that document is archived`, 404))
    }

    if (!data) {
        return next(new AppError(`no document found with that id`, 404))
    }

    // Get all status information in a single aggregation
    const statusResult = await Decision.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'options',
                let: { decisionId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$parentDecision', '$$decisionId'] }, { $eq: ['$isArchived', false] }] } } }
                ],
                as: 'options'
            }
        },
        {
            $lookup: {
                from: 'criterias', // Note: MongoDB collection names are usually pluralized
                let: { decisionId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$parentDecision', '$$decisionId'] }, { $eq: ['$isArchived', false] }] } } }
                ],
                as: 'criteria'
            }
        },
        {
            $lookup: {
                from: 'reports',
                let: { decisionId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$parentDecision', '$$decisionId'] }, { $eq: ['$isArchived', false] }] } } }
                ],
                as: 'reports'
            }
        },
        {
            $addFields: {
                status: {
                    hasOptions: { $gt: [{ $size: '$options' }, 1] },
                    hasCriteria: { $gt: [{ $size: '$criteria' }, 0] },
                    isDecided: { $gt: [{ $size: '$reports' }, 0] }
                }
            }
        }
    ]);

    // For isFullyRanked, we still need a separate query due to complex logic
    const isFullyRanked = await getAllCriteriaStatus(id);

    const status = {
        ...statusResult[0]?.status,
        isFullyRanked
    };

    // Add status to the data object
    const dataWithStatus = {
        ...data.toObject(),
        status
    };

    res.status(200).json({
        status: "success",
        data: dataWithStatus
    });
})

// Helper function to check if all criteria are fully ranked
const getAllCriteriaStatus = async (decisionId) => {
    // Get all non-archived criteria for the decision
    const criteria = await Criteria.find({
        parentDecision: decisionId,
        isArchived: false
    });

    // If no criteria exist, return false
    if (criteria.length === 0) {
        return false;
    }

    // Count all active options that belong to the decision
    const optionsCount = await Option.countDocuments({
        parentDecision: decisionId,
        isArchived: false
    });

    // If no options exist, return false
    if (optionsCount === 0) {
        return false;
    }

    // Check each criterion to see if it's fully ranked
    for (const criterion of criteria) {
        // Count all active rankings that belong to the criterion for active options only
        const distinctRankedOptionsCount = (await Ranking.distinct('optionId', {
            criterionId: criterion._id,
            isArchived: false
        })).length;

        // If this criterion doesn't have all options ranked, return false
        if (optionsCount !== distinctRankedOptionsCount) {
            return false;
        }
    }

    // All criteria are fully ranked
    return true;
};

