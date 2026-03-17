const DeliveryTarget = require('../models/deliveryTargetModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllDeliveryTargets = catchAsync(async (req, res) => {
  const data = await DeliveryTarget.find({ user: req.userId }).sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});

exports.createDeliveryTarget = catchAsync(async (req, res, next) => {
  const { kindleEmail, label, enabled } = req.body || {};

  if (!kindleEmail || typeof kindleEmail !== 'string') {
    return next(new AppError('kindleEmail is required', 400));
  }

  const data = await DeliveryTarget.create({
    user: req.userId,
    kindleEmail,
    label,
    enabled,
  });

  res.status(201).json({
    status: 'success',
    data,
  });
});

exports.getDeliveryTarget = catchAsync(async (req, res, next) => {
  const data = await DeliveryTarget.findOne({ _id: req.params.id, user: req.userId });
  if (!data) return next(new AppError('DeliveryTarget not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.updateDeliveryTarget = catchAsync(async (req, res, next) => {
  const allowed = ['kindleEmail', 'label', 'enabled'];
  const patch = {};
  allowed.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) patch[k] = req.body[k];
  });

  const data = await DeliveryTarget.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: patch },
    { new: true, runValidators: true }
  );
  if (!data) return next(new AppError('DeliveryTarget not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.deleteDeliveryTarget = catchAsync(async (req, res, next) => {
  const data = await DeliveryTarget.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!data) return next(new AppError('DeliveryTarget not found', 404));

  res.status(204).json({ status: 'success', data: null });
});

