const Timing = require('../models/timingModel');
const Target = require('../models/targetModel');
const Prompt = require('../models/promptModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const notArchived = { isArchived: { $ne: true } };
const timingScope = req => ({ user: req.userId, isArchived: { $ne: true } });
const populateActiveTargets = { path: 'targets', match: notArchived };

function normalizeTimingDoc(raw) {
  if (!raw) return raw;
  const t = { ...raw };
  return t;
}

async function assertTargetsOwned(userId, ids) {
  if (!ids || !ids.length) return true;
  const unique = [...new Set(ids.map(id => String(id)))];
  const count = await Target.countDocuments({
    _id: { $in: unique },
    user: userId,
    ...notArchived,
  });
  return count === unique.length;
}

function compactPopulatedTargets(timingDoc) {
  const t = timingDoc.toObject ? timingDoc.toObject() : { ...timingDoc };
  t.targets = (t.targets || []).filter(Boolean);
  return t;
}

async function loadTimingWithRefs(timingId, userId) {
  const raw = await Timing.findOne({ _id: timingId, user: userId, ...notArchived })
    .populate(populateActiveTargets)
    .lean();
  return normalizeTimingDoc(raw);
}

exports.getAllTimings = catchAsync(async (req, res) => {
  const rows = await Timing.find(timingScope(req))
    .sort({ createdAt: 1 })
    .populate(populateActiveTargets)
    .lean();

  const data = rows
    .map(normalizeTimingDoc)
    .map(t => ({
      ...t,
      targets: (t.targets || []).filter(Boolean),
    }));

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});

exports.createTiming = catchAsync(async (req, res, next) => {
  const { prompt, schedule, targets } = req.body || {};

  if (!prompt) {
    return next(new AppError('prompt is required', 400));
  }
  if (!schedule || typeof schedule !== 'object') {
    return next(new AppError('schedule is required', 400));
  }

  const promptExists = await Prompt.exists({ _id: prompt, user: req.userId, ...notArchived });
  if (!promptExists) return next(new AppError('prompt not found', 404));

  const targetList = targets === undefined || targets === null ? [] : targets;
  if (!Array.isArray(targetList)) {
    return next(new AppError('targets must be an array of target ids', 400));
  }
  if (targetList.length > 0) {
    const ok = await assertTargetsOwned(req.userId, targetList);
    if (!ok) return next(new AppError('one or more targets not found', 404));
  }

  const data = await Timing.create({
    user: req.userId,
    schedule,
    targets: targetList,
  });

  const doc = await loadTimingWithRefs(data._id, req.userId);
  res.status(201).json({ status: 'success', data: compactPopulatedTargets(doc) });
});

exports.getTiming = catchAsync(async (req, res, next) => {
  const data = await loadTimingWithRefs(req.params.id, req.userId);

  if (!data || !data.prompt) {
    return next(new AppError('Timing not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: compactPopulatedTargets(data),
  });
});

exports.updateTiming = catchAsync(async (req, res, next) => {
  const allowed = ['prompt', 'schedule', 'targets'];
  const patch = {};
  allowed.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) patch[k] = req.body[k];
  });

  if (patch.prompt) {
    const ok = await Prompt.exists({ _id: patch.prompt, user: req.userId, ...notArchived });
    if (!ok) return next(new AppError('prompt not found', 404));
  }

  if (patch.targets !== undefined) {
    const targetList = patch.targets === null ? [] : patch.targets;
    if (!Array.isArray(targetList)) {
      return next(new AppError('targets must be an array of target ids', 400));
    }
    patch.targets = targetList;
    if (targetList.length > 0) {
      const ok = await assertTargetsOwned(req.userId, targetList);
      if (!ok) return next(new AppError('one or more targets not found', 404));
    }
  }

  const data = await Timing.findOneAndUpdate(
    { _id: req.params.id, ...timingScope(req) },
    { $set: patch },
    { new: true, runValidators: true }
  );

  if (!data) {
    return next(new AppError('Timing not found', 404));
  }

  const doc = await loadTimingWithRefs(data._id, req.userId);
  if (!doc || !doc.prompt) {
    return next(new AppError('Timing not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: compactPopulatedTargets(doc),
  });
});

exports.deleteTiming = catchAsync(async (req, res, next) => {
  const data = await Timing.findOneAndUpdate(
    { _id: req.params.id, ...timingScope(req) },
    { $set: { isArchived: true } },
    { new: true }
  );
  if (!data) return next(new AppError('Timing not found', 404));

  res.status(204).json({ status: 'success', data: null });
});
