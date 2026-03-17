const Content = require('../models/contentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllContent = catchAsync(async (req, res) => {
  const data = await Content.find({ user: req.userId }).sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});

exports.createContent = catchAsync(async (req, res, next) => {
  const { type, name, topics, params, enabled } = req.body || {};

  if (topics !== undefined && !Array.isArray(topics)) {
    return next(new AppError('topics must be an array of strings', 400));
  }

  const data = await Content.create({
    user: req.userId,
    type,
    name,
    topics,
    params,
    enabled,
  });

  res.status(201).json({ status: 'success', data });
});

exports.getContent = catchAsync(async (req, res, next) => {
  const data = await Content.findOne({ _id: req.params.id, user: req.userId });
  if (!data) return next(new AppError('Content not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.updateContent = catchAsync(async (req, res, next) => {
  const allowed = ['type', 'name', 'topics', 'params', 'enabled'];
  const patch = {};
  allowed.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) patch[k] = req.body[k];
  });

  if (patch.topics !== undefined && !Array.isArray(patch.topics)) {
    return next(new AppError('topics must be an array of strings', 400));
  }

  const data = await Content.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: patch },
    { new: true, runValidators: true }
  );
  if (!data) return next(new AppError('Content not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.deleteContent = catchAsync(async (req, res, next) => {
  const data = await Content.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!data) return next(new AppError('Content not found', 404));

  res.status(204).json({ status: 'success', data: null });
});

