const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const Criteria = require('./../models/criteriaModel')
const Ranking = require('./../models/rankingsModel')
const Options = require('./../models/optionsModel');

exports.updateCriterion = factory.updateOne(Criteria);
exports.deleteCriterion = factory.archiveOne(Criteria);
exports.addCriterion = factory.addOne(Criteria);
exports.getCriterion = factory.getOne(Criteria);
exports.validateChildCriterion = factory.validateChild(Criteria);

exports.getAllCriteria = catchAsync(async (req, res) => {
    //set pagination filters
    const count = await Criteria.countDocuments();
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || count;
    const skip = (page - 1) * limit;
    const lastPage = (count <= (skip + limit)) ? true : false ;

    //validate that the child is of the parents decision, and only do that for child documents
    const query = req.params.decisionId? {parentDecision: { $in: req.params.decisionId }, isArchived : false} : {'accessControl.userId' : req.userId, isArchived : false};

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
    
    // count all options that belong to the decision
    const optionsCount = await Options.countDocuments({ parentDecision: decisionId, isArchived: false });
    
    //count all the rankings that belong to the criterion
    const rankingsCount = await Ranking.countDocuments({ criterionId: criteriaId });

    //check if all the criteria have been ranked 
    // TODO what happens here if options is archvied but rankings are not?
    const isRanked = optionsCount === rankingsCount ? true : false;
    return isRanked
}