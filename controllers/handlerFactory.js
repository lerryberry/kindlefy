const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

exports.addOne = Model => catchAsync(async (req, res, next) => {
    req.body.parentDecision = req.params.decisionId;
    const request = { ...req.body, userId: req.userId };
    const data = await Model.create(request);

    res.status(201).json({
        status: "success",
        data
    });
})

exports.getOne = Model => catchAsync(async (req, res, next) => {
    const data = await Model.findById(req.params.id);

    if(!data){
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(200).json({
        status: "success",
        data
    });
})

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const data = await Model.findOneAndDelete(req.params.id);

    if(!data){
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!data){
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(200).json({
        status: "success",
        data
    });
})

exports.getAll = Model => catchAsync(async (req, res) => {
    const count = await Model.countDocuments();
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || count;
    const skip = (page - 1) * limit;

    const lastPage = (count <= (skip + limit)) ? true : false ;

    //change query based off getAll request type
    const query = req.params.decisionId? {parentDecision: { $in: req.params.decisionId }} : {userId: req.userId};

    const data = await Model.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        status: "success",
        results: data.length,
        data,
        lastPage: lastPage
    });
})