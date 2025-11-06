const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Criteria = require('../models/criteriaModel')
const Ranking = require('../models/rankingsModel')
const Options = require('../models/optionsModel');
const Decision = require('../models/decisionModel');
const { getCompletion } = require('../utils/openai');

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
    let output = await Promise.all(
        allCriteria.map(async (data) => {
            const isRanked = await getCriterionStatus(data._id, req.params.decisionId);
            data._doc.isRanked = isRanked;
            return data
        })
    );

    // If AI suggestions are enabled and we have a decisionId, generate suggestions
    // Only suggest when there are no existing criteria
    if (req.userPreferences?.aiSuggestions === true && req.params.decisionId && output.length === 0) {
        try {
            const suggestionsNeeded = 3;
            // Fetch decision and options
            const decision = await Decision.findById(req.params.decisionId);
            const options = await Options.find({
                parentDecision: req.params.decisionId,
                isArchived: false
            }).select('title description');

            if (decision) {
                // Build prompt for OpenAI
                const optionsText = options.length > 0
                    ? options.map(opt => `- ${opt.title}${opt.description ? `: ${opt.description}` : ''}`).join('\n')
                    : 'No options have been added yet.';

                const prompt = `You are helping someone make a decision. 

Decision Title: ${decision.title}
Decision Type: ${decision.category || 'GENERIC'}

Options so far:
${optionsText}

The user needs criteria (qualities/attributes) to evaluate these options. Please suggest ${suggestionsNeeded} criteria that would help evaluate these options. Each criterion should be a positive quality (e.g., "affordability", "ease of use", "reliability").

Return ONLY a JSON array of strings, where each string is a criterion title. Do not include any other text, explanations, or formatting. Example format:
["criterion 1", "criterion 2", "criterion 3"]`;

                const aiResponse = await getCompletion(prompt, {
                    model: 'gpt-4o-mini',
                    temperature: 0.7,
                    max_tokens: 200
                });

                // Parse the JSON response
                let suggestedCriteriaTitles = [];
                try {
                    // Try to extract JSON array from the response
                    const jsonMatch = aiResponse.match(/\[.*\]/s);
                    if (jsonMatch) {
                        suggestedCriteriaTitles = JSON.parse(jsonMatch[0]);
                    } else {
                        // Fallback: try parsing the whole response
                        suggestedCriteriaTitles = JSON.parse(aiResponse);
                    }
                } catch (parseError) {
                    // If parsing fails, try to extract criteria from lines
                    const lines = aiResponse.split('\n').filter(line => line.trim());
                    suggestedCriteriaTitles = lines
                        .map(line => line.replace(/^[-*•]\s*/, '').replace(/"/g, '').trim())
                        .filter(line => line.length > 0)
                        .slice(0, suggestionsNeeded);
                }

                // Ensure we have an array and limit to suggestionsNeeded
                if (!Array.isArray(suggestedCriteriaTitles)) {
                    suggestedCriteriaTitles = [];
                }
                suggestedCriteriaTitles = suggestedCriteriaTitles.slice(0, suggestionsNeeded);

                // Create criteria in the database
                const documentsToCreate = suggestedCriteriaTitles.map((title) => ({
                    title: title.trim(),
                    priority: 'UNSORTED',
                    parentDecision: req.params.decisionId
                }));

                // Create criteria in database (slug will be auto-generated by pre-save hook)
                await Promise.all(
                    documentsToCreate.map(doc => Criteria.create(doc))
                );

                // Refetch all criteria including the newly created ones
                const allCriteriaWithSuggestions = await Criteria.find(query)
                    .sort({ createdAt: 1 })
                    .skip(skip)
                    .limit(limit);

                // Get isRanked status for all criteria
                const criteriaWithStatus = await Promise.all(
                    allCriteriaWithSuggestions.map(async (criterion) => {
                        const isRanked = await getCriterionStatus(criterion._id, req.params.decisionId);
                        criterion._doc.isRanked = isRanked;
                        return criterion;
                    })
                );

                // Update output with all criteria including suggestions
                output = criteriaWithStatus;
            }
        } catch (error) {
            // Log error but don't fail the request
            console.error('Error generating AI criteria suggestions:', error.message);
        }
    }

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