const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.addOne = Model => catchAsync(async (req, res, next) => {
    //add parentDecision for those requests that are children of a decision
    req.body.parentDecision = req.params.decisionId;

    //validate there's not another document with the same title
    const existingDoc = await Model.countDocuments({ title: req.body.title, parentDecision: req.params.decisionId, isArchived: false });
    if (existingDoc) {
        return next(new AppError(`Document with that name already exists`, 404))
    }

    //TODO
    const query = {
        ...req.body,
        accessControl: [{
            userId: req.userId,
            permissions: ['READ', 'UPDATE', 'DELETE', 'RANK']
        }]
    };
    const data = await Model.create(query);

    res.status(201).json({
        status: "success",
        data
    });
})

exports.getOne = Model => catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const id = req.params.id;

    //validate that the child is of the parents decision, and only do that for child documents
    const query = decisionId ? { _id: id, parentDecision: decisionId } : { _id: id };

    const data = await Model.findOne(query);

    if (data.isArchived) {
        return next(new AppError(`that document is archived`, 404))
    }

    if (!data) {
        return next(new AppError(`no document found with that id from the provided decision`, 404))
    }

    res.status(200).json({
        status: "success",
        data
    });
})

exports.archiveOne = Model => catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const id = req.params.id;

    //validate that the child is of the parents decision, and only do that for child documents
    const query = decisionId ? { _id: id, parentDecision: decisionId } : { _id: id };

    const data = await Model.findOneAndUpdate(query, { isArchived: true }, {
        new: true,
        runValidators: true
    });

    if (!data) {
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    });
})

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const id = req.params.id;

    //validate that the child is of the parents decision, and only do that for child documents
    const query = decisionId ? { _id: id, parentDecision: decisionId } : { _id: id };

    const data = await Model.findOneAndDelete(query);

    if (!data) {
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(204).json({
        status: "success",
        data: null
    });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const id = req.params.id;

    //validate that the child is of the parents decision, and only do that for child documents
    const query = decisionId ? { _id: id, parentDecision: decisionId, isArchived: false } : { _id: id, isArchived: false };

    const data = await Model.findOneAndUpdate(query, req.body, {
        new: true,
        runValidators: true
    });

    if (!data) {
        return next(new AppError(`no document found with that id`, 404))
    }

    res.status(200).json({
        status: "success",
        data
    });
})

exports.getAll = Model => catchAsync(async (req, res) => {
    //set pagination filters
    const count = await Model.countDocuments();
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || count;
    const skip = (page - 1) * limit;
    const lastPage = (count <= (skip + limit)) ? true : false;

    //validate that the child is of the parents decision, and only do that for child documents
    const query = req.params.decisionId ? { parentDecision: { $in: req.params.decisionId }, isArchived: false } : { 'accessControl.userId': req.userId, isArchived: false };

    //use pagination filters
    const data = await Model.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        status: "success",
        results: data.length,
        data,
        lastPage: lastPage
    });
})

exports.validateChild = Model => catchAsync(async (req, res, next) => {
    const decisionId = req.params.decisionId;
    const id = req.params.id;

    //validate the criterion and options isn't archived
    const doc = await Model.find({ _id: id })
    if (doc[0].isArchived) {
        return next(new AppError(`Doc is archived`, 404))
    }

    //validate the criterion or option is the child of the decision
    const isChild = await Model.countDocuments({ _id: id, parentDecision: decisionId });
    if (isChild === 0) {
        return next(new AppError(`Document does not belong to the decision`, 404));
    }
    next()
})