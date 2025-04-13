//const { query } = require('express');
const Decision = require('./../models/decisionModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.updateDecision = factory.updateOne(Decision);
exports.deleteDecision = factory.deleteOne(Decision);
exports.getAllDecisions = factory.getAll(Decision);
exports.addDecision = factory.addOne(Decision);
exports.getDecision = factory.getOne(Decision);

exports.validateDecisionOwner = catchAsync(async (req, res, next) => {
    //make this function work for all routes
    const id = req.params.decisionId? req.params.decisionId : req.params.id ;
    const decision = await Decision.find({_id: id, userId: req.userId})

    if (decision.length === 0) {
        return next(new AppError(`authenticated user doesn't own that document`, 404))
    }
    
    next();
})