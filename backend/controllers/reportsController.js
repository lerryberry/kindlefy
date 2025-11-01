const Report = require('../models/reportModel');
const Decision = require('../models/decisionModel');
const Option = require('../models/optionsModel');
const Criteria = require('../models/criteriaModel');
const Ranking = require('../models/rankingsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReport = catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const { optionId } = req.body;
    const userId = req.userId;

    console.log(decisionId, optionId, userId);
    // Validate the decision exists
    const decision = await Decision.findOne({
        _id: decisionId,
        isArchived: false
    });

    if (!decision) {
        return next(new AppError('Decision not found or access denied', 404));
    }

    // Validate the option exists and belongs to this decision
    const option = await Option.findOne({
        _id: optionId,
        parentDecision: decisionId,
        isArchived: false
    });

    if (!option) {
        return next(new AppError('Option not found or archived', 404));
    }

    // Archive any existing active reports for this decision
    await Report.updateMany(
        { parentDecision: decisionId, isArchived: false },
        { isArchived: true }
    );

    // Create new report
    const report = await Report.create({
        parentDecision: decisionId,
        winningOptionId: optionId,
        userId: userId,
        isArchived: false
    });

    res.status(201).json({
        status: 'success',
        data: report
    });
});

//The getReport function is the final outcome of all the rankings, this function does all the maths to determine the grand final score for each option. It's used in the report page.
//it looks at the options ranking against each criterion, giving higher scores to those more favourable (i.e. BEST_CHOICE), and then multiplies that by the importance of the associated 
//criterion, more important criterion (MUST HAVE have a higher score, which boosts the final calculated score).
exports.getReport = catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;

    // Get the decision to include title in response
    const decision = await Decision.findOne({
        _id: decisionId,
        isArchived: false
    });

    if (!decision) {
        return next(new AppError('Decision not found or access denied', 404));
    }

    //TODO use decision status here instead of below approach.. Get the active report to find the winner
    const activeReport = await Report.findOne({
        parentDecision: decisionId,
        isArchived: false
    });

    // receives decision id, builds an array of objects with option id & title
    const options = await Option.find({ parentDecision: decisionId, isArchived: false });
    const criteria = await Criteria.find({ parentDecision: decisionId, isArchived: false });

    // receives criterion id, and returns a single figure of how much to increase the score by
    const getCriterionScore = async (criteriaId) => {
        const criterion = criteria.find(obj => obj._id.toString() === criteriaId.toString());
        if (!criterion) {
            // should have default to MUST_HAVE score if no criterion is found
            return 6
        }
        let multiple
        switch (criterion.priority) {
            case "MUST_HAVE":
                multiple = 6;
                break;
            case "SHOULD_HAVE":
                multiple = 4;
                break;
            case "COULD_HAVE":
                multiple = 2;
                break;
        }
        return multiple
    };

    // receives criterion id, and returns the global rank to subtract from the score
    const getCriterionRanking = async (criteriaId) => {
        const criterion = criteria.find(obj => obj._id.toString() === criteriaId.toString());
        if (!criterion) {
            return 0
        }
        return criterion.globalRank || 0;
    };

    const getCriterionPriorityName = async (criteriaId) => {
        const criterion = criteria.find(obj => obj._id.toString() === criteriaId.toString());
        return criterion ? criterion.priority : 'UNKNOWN';
    }

    // determines the multiplier for the score based on the match level
    const getMatchScore = async (matchValue) => {
        let matchScore
        switch (matchValue) {
            case "BEST_CHOICE":
                matchScore = 6;
                break;
            case "IMPARTIAL":
                matchScore = 4;
                break;
            case "WORST_CHOICE":
                matchScore = 1;
                break;
        }
        return matchScore
    };

    const returnHighestPossibleScore = async () => {
        const bestChoiceScore = await getMatchScore("BEST_CHOICE");
        const mustHaveScore = await getCriterionScore("MUST_HAVE");
        const IDEAL_GLOBAL_RANK = 1;
        const idealScorePerCriterion = (bestChoiceScore * mustHaveScore) - IDEAL_GLOBAL_RANK; // (6 * 6) - 1 = 35
        const highestPossibleScore = idealScorePerCriterion * criteria.length;
        return highestPossibleScore;
    }

    // augments the options array by going through items one by one, searching each option in the rankings, and adding to the score
    // mongo aggregate are more efficient but break my feeble mind :(, so in-app it is!
    const data = await Promise.all(
        options.map(async (option) => {
            const optionId = option._id;
            option._doc.grandTotalCriteriaScore = 0;
            option._doc.criteriaRankingAnalysis = []; // Initialize criteriaRankingAnalysis as an empty array here

            // Return all rankings for this option grouped by criteria
            const rankings = await Ranking.aggregate([
                { $match: { optionId: optionId, isArchived: false } }, // Get all unarchived rankings available for this option
                { $sort: { createdAt: -1 } }, // Sort rankings by createdAt in descending order
                { $group: { _id: '$criterionId', doc: { $first: '$$ROOT' } } }, // Group rankings by criterionId and only keep the first (and newest) in each group. Each option can only be ranked once per criterion.
                { $replaceRoot: { newRoot: '$doc' } } //
            ]);

            // Process all rankings concurrently
            const scoreUpdates = await Promise.all(
                rankings.map(async (rank) => {
                    const score = await getMatchScore(rank.matchLevel);
                    const multiple = await getCriterionScore(rank.criterionId);
                    const criterionRanking = await getCriterionRanking(rank.criterionId);
                    const criterionPriorityName = await getCriterionPriorityName(rank.criterionId);
                    const scoreContribution = (score * multiple) - criterionRanking; // Calculate the individual score contribution minus ranking

                    // Add details of this score change to the criteriaRankingAnalysis array
                    const criterion = criteria.find(obj => obj._id.toString() === rank.criterionId.toString());
                    const matchLevelNatural = rank.matchLevel === 'BEST_CHOICE' ? 'best choices' :
                        rank.matchLevel === 'IMPARTIAL' ? 'impartial options' :
                            'worst choices';
                    const priorityNatural = criterion ? (
                        criterion.priority === 'MUST_HAVE' ? 'must-have' :
                            criterion.priority === 'SHOULD_HAVE' ? 'should-have' :
                                criterion.priority === 'COULD_HAVE' ? 'could-have' :
                                    'unsorted'
                    ) : 'unsorted';
                    const rankingSummary = `This option was ranked as number ${rank.rank} against all options. It was determined to be one of the ${matchLevelNatural} for this criterion (${priorityNatural} priority).`;
                    option._doc.criteriaRankingAnalysis.push({
                        _id: rank.criterionId,
                        title: criterion ? criterion.title : 'Unknown Criterion',
                        rankingSummary: rankingSummary,
                        // Add any other relevant info here
                    });

                    //add tags to the option if the category is BEST_CHOICE
                    if (rank.matchLevel === "BEST_CHOICE") {
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
            option._doc.grandTotalCriteriaScore = scoreUpdates.reduce((sum, score) => sum + score, 0);
            const highestPossibleScore = await returnHighestPossibleScore();
            option._doc.percentageSimilarToBestTheoreticallyPossibleScore = (option._doc.grandTotalCriteriaScore / highestPossibleScore) * 100;

            return option;
        })
    );

    // if there's no options found for the report, return an error
    if (!data) {
        return next(new AppError(`no document found with that id`, 404))
    }

    //sort highest to lowest by default
    data.sort((a, b) => b._doc.grandTotalCriteriaScore - a._doc.grandTotalCriteriaScore);

    // Add isWinner flag and remove parentDecision from each option
    const winnerOptionId = activeReport ? activeReport.winningOptionId.toString() : null;
    data.forEach((option) => {
        option._doc.isWinner = option._id.toString() === winnerOptionId;
        // Remove parentDecision from option response
        if (option._doc.parentDecision) {
            delete option._doc.parentDecision;
        }
        // Remove grandTotalCriteriaScore from response
        if (option._doc.grandTotalCriteriaScore) {
            delete option._doc.grandTotalCriteriaScore;
        }
    });

    res.status(200).json({
        status: "success",
        data: {
            decisionDetails: {
                _id: decision._id.toString(),
                title: decision.title
            },
            options: data
        }
    });
});
