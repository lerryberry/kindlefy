const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const Criteria = require('./../models/criteriaModel')
const Ranking = require('./../models/rankingsModel')
const Options = require('./../models/optionsModel');

exports.updateCriterion = factory.updateOne(Criteria);
exports.deleteCriterion = factory.archiveOne(Criteria);
//exports.getAllCriteria = factory.getAll(Criteria);
exports.addCriterion = factory.addOne(Criteria);
exports.getCriterion = factory.getOne(Criteria);
exports.validateChildCriterion = factory.validateChild(Criteria);

exports.getAllCriteria = catchAsync(async (req, res) => {
    const count = await Criteria.countDocuments();
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || count;
    const skip = (page - 1) * limit;

    const lastPage = (count <= (skip + limit)) ? true : false ;

    // validate that the child is of the parents decision, and only do that for child documents
    const query = req.params.decisionId? {parentDecision: { $in: req.params.decisionId }} : {userId: req.userId};

    const allCriteria = await Criteria.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

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
    //TODO rely on decision in req.body?
    
    const optionsCount = await Options.countDocuments({ parentDecision: decisionId });
    //console.log(`${optionsCount} for ${decisionId}`);
    const rankingsCount = await Ranking.countDocuments({ criterion: criteriaId });
    //console.log(`${rankingsCount} for ${criteriaId}`);

    const isRanked = optionsCount === rankingsCount ? true : false;
    return isRanked
}