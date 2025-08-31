const Decision = require('../models/decisionModel');
const Option = require('../models/optionsModel');
const Ranking = require('../models/rankingsModel');
const Criteria = require('../models/criteriaModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.updateDecision = factory.updateOne(Decision);
exports.deleteDecision = factory.archiveOne(Decision);
exports.getAllDecisions = factory.getAll(Decision);
exports.addDecision = factory.addOne(Decision);
exports.getDecision = factory.getOne(Decision);

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

//The getReport function is the final outcome of all the rankings, this function does all the maths to determine the grand final score for each option. It's used in the report page.
//it looks at the options ranking against each criterion, giving higher scores to those more favourable (i.e. BEST), and then multiplies that by the importance of the associated 
//criterion, more important criterion (MUST HAVE have a higher score, which boosts the final calculated score.
exports.getReport = catchAsync(async (req, res, next) => {
    const decisionId = req.params.id;

    // receives decision id, builds an array of objects with option id & title
    const options = await Option.find({ parentDecision: decisionId, isArchived: false });
    const criteria = await Criteria.find({ parentDecision: decisionId, isArchived: false });

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

    const getCriterionPriorityName = async (criteriaId) => {
        const criterion = criteria.find(obj => obj._id.toString() === criteriaId.toString());
        return criterion ? criterion.priority : 'UNKNOWN';
    }

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

    // augments the options array by going through items one by one, searching each option in the rankings, and adding to the score
    // mongo aggregate are more efficient but break my feeble mind :(, so in-app it is!
    const data = await Promise.all(
        options.map(async (option) => {
            const optionId = option._id;
            option._doc.score = 0;
            option._doc.meta = []; // Initialize meta as an empty array here

            // Find all rankings for this option's ID
            // TODO ensure rankings aren't archived
            const rankings = await Ranking.aggregate([
                { $match: { optionId: optionId, isArchived: false } },
                { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
                { $group: { _id: '$criterionId', doc: { $first: '$$ROOT' } } },
                { $replaceRoot: { newRoot: '$doc' } }
            ]);

            // Process all rankings concurrently
            const scoreUpdates = await Promise.all(
                rankings.map(async (rank) => {
                    const score = await getMatchScore(rank.matchLevel);
                    const multiple = await getCriterionScore(rank.criterionId);
                    const criterionPriorityName = await getCriterionPriorityName(rank.criterionId);
                    const scoreContribution = score * multiple; // Calculate the individual score contribution

                    // Add details of this score change to the meta array
                    option._doc.meta.push({
                        criterionId: rank.criterionId,
                        math: `${score}(${rank.matchLevel}) * ${multiple}(${criterionPriorityName}) = ${scoreContribution}`,
                        // Add any other relevant info here
                    });

                    //add tags to the option if the category is BEST
                    if (rank.matchLevel === "BEST") {
                        option._doc.tags = option._doc.tags || [];
                        const tag = criteria.find(obj => obj._id.toString() === rank.criterionId.toString());
                        if (tag && tag.title && !option._doc.tags.includes(tag.title)) { // Avoid duplicate tags
                            option._doc.tags.push(tag.title);
                        }
                    }

                    return scoreContribution; // Still return the numerical score for the sum
                })
            );

            // Aggregate the scores
            option._doc.score = scoreUpdates.reduce((sum, score) => sum + score, 0);

            return option;
        })
    );

    // if there's no options found for the report, return an error
    if (!data) {
        return next(new AppError(`no document found with that id`, 404))
    }

    //sort highest to lowest by default
    data.sort((a, b) => b._doc.score - a._doc.score);

    res.status(200).json({
        status: "success",
        data
    });
});