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

    //TODO permissions
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

exports.addMany = Model => catchAsync(async (req, res, next) => {
    const inputArray = req.body;

    // Validate that input is an array
    if (!Array.isArray(inputArray)) {
        return next(new AppError(`Array of objects is required`, 400))
    }

    if (inputArray.length === 0) {
        return next(new AppError(`Array must not be empty`, 400))
    }

    // Extract titles for duplicate checking
    const titles = inputArray.map(item => item.title).filter(title => title);

    if (titles.length === 0) {
        return next(new AppError(`All objects must have a title property`, 400))
    }

    // validate there's not another document with the same titles
    const existingDocs = await Model.find({
        title: { $in: titles },
        parentDecision: req.params.decisionId,
        isArchived: false
    });

    if (existingDocs.length > 0) {
        const existingTitles = existingDocs.map(doc => doc.title);
        return next(new AppError(`Documents with these titles already exist: ${existingTitles.join(', ')}`, 400))
    }

    // Create documents array with access control
    const documentsToCreate = inputArray.map(item => ({
        ...item,
        parentDecision: req.params.decisionId,
        accessControl: [{
            userId: req.userId,
            permissions: ['READ', 'UPDATE', 'DELETE', 'RANK']
        }]
    }));

    // can't be insertMany because the slugify function is not compatible with insertMany
    const data = await Promise.all(documentsToCreate.map(doc => Model.create(doc)));

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

    // If updating title, validate there's not another document with the same title
    if (req.body && typeof req.body.title === 'string' && req.body.title.trim().length > 0) {
        const duplicateCount = await Model.countDocuments({
            _id: { $ne: id },
            title: req.body.title,
            parentDecision: decisionId,
            isArchived: false
        });
        if (duplicateCount > 0) {
            return next(new AppError(`Document with that name already exists`, 400));
        }
    }

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