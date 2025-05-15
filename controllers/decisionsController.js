const Decision = require('./../models/decisionModel');
const Option = require('./../models/optionsModel');
const Ranking = require('./../models/rankingsModel');
const Criteria = require('./../models/criteriaModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.updateDecision = factory.updateOne(Decision);
exports.deleteDecision = factory.archiveOne(Decision);
exports.getAllDecisions = factory.getAll(Decision);
exports.addDecision = factory.addOne(Decision);
exports.getDecision = factory.getOne(Decision);

exports.validateDecision = catchAsync(async (req, res, next) => {
    // make this function work for all routes, parent or child
    const id = req.params.decisionId? req.params.decisionId : req.params.id ;
    const decision = await Decision.find({_id: id, 'accessControl.userId': req.userId})

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

exports.getReport = catchAsync(async (req, res, next) => {
    const decisionId = req.params.id;

    // receives decision id, builds an array of objects with option id & title
    const options = await Option.find({parentDecision: decisionId, isArchived: false});
    const criteria = await Criteria.find({parentDecision: decisionId, isArchived: false});
    
    // receives criterion id, and returns a single figure of how much to increase the score by
    const getCriterionScore = async (criteriaId) => {
        const criterion = criteria.find(obj => obj._id.toString() === criteriaId.toString());
        if (!criterion) {
            return 1
        }
        let multiple
        switch (criterion.priority) {
            case "MUST_HAVE":
                multiple = 3;
                break;
            case "SHOULD_HAVE":
                multiple = 2;
                break;
            case "COULD_HAVE":
                multiple = 1;
                break;
        }
        return multiple
    };

    // determines the multiplier for the score based on the match level
    const getMatchScore = async (matchValue) => {
        let matchScore
        switch (matchValue) {
            case "BEST":
                matchScore = 3;
                break;
            case "IMPARTIAL":
                matchScore = 2;
                break;
            case "WORST":
                matchScore = 1;
                break;
        }
        return matchScore
    };

    // augemtns the options array by going through items one by one, searching each option in the rankings, and adding to the score
    const data = await Promise.all(
        options.map(async (option) => {
            const optionId = option._id;
            option._doc.score = 0;
        
            // Find all rankings for this option's ID
            // TODO ensure rankings aren't archived
            const rankings = await Ranking.find({ optionId: optionId});
        
            // Process all rankings concurrently
            const scoreUpdates = await Promise.all(
                rankings.map(async (rank) => {
                    const score = await getMatchScore(rank.matchLevel);
                    const multiple = await getCriterionScore(rank.criterionId);
                    
                    //add tags to the option if the category is BEST
                    if (rank.matchLevel === "BEST") {
                        option._doc.tags = option._doc.tags || [];
                        const tag = criteria.find(obj => obj._id.toString() === rank.criterionId.toString());
                        option._doc.tags.push(tag.title);
                    }

                    return score * multiple;
                })
            );
        
            // Aggregate the scores
            option._doc.score = scoreUpdates.reduce((sum, score) => sum + score, 0);
        
            return option;
        })
    );
    
    // if there's no options found for the report, return an error
    if(!data){
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(200).json({
        status: "success",
        data
    });
});