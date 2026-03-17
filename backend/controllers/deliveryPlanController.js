const DeliveryPlan = require('../models/deliveryPlanModel');
const DeliveryTarget = require('../models/deliveryTargetModel');
const Content = require('../models/contentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllDeliveryPlans = catchAsync(async (req, res) => {
  const data = await DeliveryPlan.find({ user: req.userId })
    .sort({ createdAt: 1 })
    .populate('deliveryTarget')
    .populate('content');

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});

exports.createDeliveryPlan = catchAsync(async (req, res, next) => {
  const { deliveryTarget, content, schedule, enabled } = req.body || {};

  if (!deliveryTarget || !content) {
    return next(new AppError('deliveryTarget and content are required', 400));
  }
  if (!schedule || typeof schedule !== 'object') {
    return next(new AppError('schedule is required', 400));
  }

  // Ensure referenced docs belong to this user (prevents cross-user linking)
  const [targetExists, contentExists] = await Promise.all([
    DeliveryTarget.exists({ _id: deliveryTarget, user: req.userId }),
    Content.exists({ _id: content, user: req.userId }),
  ]);
  if (!targetExists) return next(new AppError('deliveryTarget not found', 404));
  if (!contentExists) return next(new AppError('content not found', 404));

  const data = await DeliveryPlan.create({
    user: req.userId,
    deliveryTarget,
    content,
    schedule,
    enabled,
  });

  res.status(201).json({ status: 'success', data });
});

exports.getDeliveryPlan = catchAsync(async (req, res, next) => {
  const data = await DeliveryPlan.findOne({ _id: req.params.id, user: req.userId })
    .populate('deliveryTarget')
    .populate('content');
  if (!data) return next(new AppError('DeliveryPlan not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.updateDeliveryPlan = catchAsync(async (req, res, next) => {
  const allowed = ['deliveryTarget', 'content', 'schedule', 'enabled'];
  const patch = {};
  allowed.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) patch[k] = req.body[k];
  });

  if (patch.deliveryTarget) {
    const ok = await DeliveryTarget.exists({ _id: patch.deliveryTarget, user: req.userId });
    if (!ok) return next(new AppError('deliveryTarget not found', 404));
  }
  if (patch.content) {
    const ok = await Content.exists({ _id: patch.content, user: req.userId });
    if (!ok) return next(new AppError('content not found', 404));
  }

  const data = await DeliveryPlan.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: patch },
    { new: true, runValidators: true }
  )
    .populate('deliveryTarget')
    .populate('content');

  if (!data) return next(new AppError('DeliveryPlan not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.deleteDeliveryPlan = catchAsync(async (req, res, next) => {
  const data = await DeliveryPlan.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!data) return next(new AppError('DeliveryPlan not found', 404));

  res.status(204).json({ status: 'success', data: null });
});

