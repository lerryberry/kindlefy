const Decision = require('./../models/decisionModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.updateDecision = factory.updateOne(Decision);
exports.deleteDecision = factory.archiveOne(Decision);
exports.getAllDecisions = factory.getAll(Decision);
exports.addDecision = factory.addOne(Decision);
exports.getDecision = factory.getOne(Decision);

exports.validateDecision = catchAsync(async (req, res, next) => {
    //TODO make this function work for all routes
    const id = req.params.decisionId? req.params.decisionId : req.params.id ;
    const decision = await Decision.find({_id: id, userId: req.userId})

    //TODO validate the current user's permission with regards to the decision, and attach it to the req.body
    
    //validate the decision status an active one
    if (decision[0].isArchived) {
        return next(new AppError(`Decision is archived`, 404))
    }

    //TODO attach decision id to req.body for security reasons

    //valide that the decision belongs to the user
    if (decision.length === 0) {
        return next(new AppError(`authenticated user doesn't own that decision`, 404))
    }
    
    next();
})

exports.getReport = catchAsync(async (req, res, next) => {
    const decisionId = req.params.id;

    const data = await Decision.findOne({_id: decisionId});

    // do the cool thingsssss to calculate the report


    if(!data){
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(200).json({
        status: "success",
        data
    });
});