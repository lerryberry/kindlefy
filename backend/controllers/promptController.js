const Prompt = require('../models/promptModel');
const Timing = require('../models/timingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const promptScope = req => ({ user: req.userId, isArchived: { $ne: true } });

exports.getAllPrompts = catchAsync(async (req, res) => {
  const filter = promptScope(req);
  const count = await Prompt.countDocuments(filter);

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || count;
  const skip = (page - 1) * limit;
  const lastPage = count <= skip + limit;

  const data = await Prompt.find(filter)
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: data.length,
    totalResults: count,
    page,
    limit,
    lastPage,
    data,
  });
});

exports.createPrompt = catchAsync(async (req, res, next) => {
  const { type, name, topics, params, enabled } = req.body || {};

  if (!type || typeof type !== 'string' || !type.trim()) {
    return next(new AppError('type is required', 400));
  }

  if (topics !== undefined && !Array.isArray(topics)) {
    return next(new AppError('topics must be an array of strings', 400));
  }

  const data = await Prompt.create({
    user: req.userId,
    type,
    name,
    topics,
    params,
    enabled,
  });

  res.status(201).json({ status: 'success', data });
});

exports.getPrompt = catchAsync(async (req, res, next) => {
  const data = await Prompt.findOne({ _id: req.params.id, ...promptScope(req) });
  if (!data) return next(new AppError('Prompt not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.updatePrompt = catchAsync(async (req, res, next) => {
  const allowed = ['type', 'name', 'topics', 'params', 'enabled'];
  const patch = {};
  allowed.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) patch[k] = req.body[k];
  });

  if (patch.topics !== undefined && !Array.isArray(patch.topics)) {
    return next(new AppError('topics must be an array of strings', 400));
  }

  const data = await Prompt.findOneAndUpdate(
    { _id: req.params.id, ...promptScope(req) },
    { $set: patch },
    { new: true, runValidators: true }
  );
  if (!data) return next(new AppError('Prompt not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.deletePrompt = catchAsync(async (req, res, next) => {
  const data = await Prompt.findOneAndUpdate(
    { _id: req.params.id, ...promptScope(req) },
    { $set: { isArchived: true } },
    { new: true }
  );
  if (!data) return next(new AppError('Prompt not found', 404));

  const promptId = data._id;
  await Timing.updateMany(
    {
      user: req.userId,
      isArchived: { $ne: true },
      $or: [{ prompt: promptId }, { content: promptId }],
    },
    { $set: { isArchived: true } }
  );

  res.status(204).json({ status: 'success', data: null });
});
