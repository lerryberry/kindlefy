const Target = require('../models/targetModel');
const Timing = require('../models/timingModel');
const Digest = require('../models/digestModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { assertDigestLinkedDevicesWithinCap } = require('../utils/planLimits');

const notArchived = { isArchived: { $ne: true } };
const targetScope = req => ({ user: req.userId, isArchived: { $ne: true } });

async function findTimingOwnedByUser(userId, timingId, populateOpts) {
  let q = Timing.findOne({ _id: timingId, ...notArchived });
  if (populateOpts) {
    q = q.populate(populateOpts);
  }
  const timing = await q.lean();
  if (!timing) {
    throw new AppError('Timing not found', 404);
  }
  const owned = await Digest.exists({ _id: timing.digest, user: userId, ...notArchived });
  if (!owned) {
    throw new AppError('Timing not found', 404);
  }
  return timing;
}

const timingIncludesTarget = (timing, targetId) =>
  (timing.targets || []).some(id => String(id) === String(targetId));

function targetUpdatePatchFromBody(body) {
  const b = body || {};
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(b, 'kindleEmail')) patch.kindleEmail = b.kindleEmail;
  else if (Object.prototype.hasOwnProperty.call(b, 'kindle_email')) patch.kindleEmail = b.kindle_email;
  if (Object.prototype.hasOwnProperty.call(b, 'label')) patch.label = b.label;
  return patch;
}

async function validateKindleEmailForUpdate(patch, userId, excludeTargetId, next) {
  if (patch.kindleEmail === undefined) return true;
  if (typeof patch.kindleEmail !== 'string') {
    next(new AppError('kindleEmail must be a string', 400));
    return false;
  }
  patch.kindleEmail = patch.kindleEmail.trim().toLowerCase();
  if (!patch.kindleEmail) {
    next(new AppError('kindleEmail cannot be empty', 400));
    return false;
  }
  const dup = await Target.exists({
    user: userId,
    kindleEmail: patch.kindleEmail,
    _id: { $ne: excludeTargetId },
    ...notArchived,
  });
  if (dup) {
    next(new AppError('Another target already uses this Kindle email', 400));
    return false;
  }
  return true;
}

exports.getAllTargets = catchAsync(async (req, res) => {
  const data = await Target.find(targetScope(req)).sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});

exports.createTarget = catchAsync(async (req, res, next) => {
  const { kindleEmail, label } = req.body || {};

  if (!kindleEmail || typeof kindleEmail !== 'string') {
    return next(new AppError('kindleEmail is required', 400));
  }

  const data = await Target.create({
    user: req.userId,
    kindleEmail: kindleEmail.trim().toLowerCase(),
    label,
  });

  res.status(201).json({ status: 'success', data });
});

exports.getTarget = catchAsync(async (req, res, next) => {
  const data = await Target.findOne({ _id: req.params.id, ...targetScope(req) });
  if (!data) return next(new AppError('Target not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.updateTarget = catchAsync(async (req, res, next) => {
  const patch = targetUpdatePatchFromBody(req.body);
  if (!(await validateKindleEmailForUpdate(patch, req.userId, req.params.id, next))) return;

  const data = await Target.findOneAndUpdate(
    { _id: req.params.id, ...targetScope(req) },
    { $set: patch },
    { new: true, runValidators: true }
  );
  if (!data) return next(new AppError('Target not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.deleteTarget = catchAsync(async (req, res, next) => {
  const existing = await Target.findOne({ _id: req.params.id, ...targetScope(req) });
  if (!existing) return next(new AppError('Target not found', 404));

  const ownedDigestIds = await Digest.distinct('_id', { user: req.userId, ...notArchived });
  const digestIds = await Timing.distinct('digest', {
    digest: { $in: ownedDigestIds },
    ...notArchived,
    targets: existing._id,
  });

  for (const digestId of digestIds) {
    const digest = await Digest.findOne({ _id: digestId, user: req.userId, ...notArchived }).lean();
    if (!digest || digest.enabled === false) continue;

    const timings = await Timing.find({ digest: digestId, ...notArchived }).lean();
    for (const t of timings) {
      const ids = (t.targets || []).map((id) => String(id)).filter(Boolean);
      if (ids.length === 1 && ids[0] === String(existing._id)) {
        return next(
          new AppError(
            'Turn this digest off before removing its only Kindle on a schedule. You can delete the device after the digest is off.',
            400
          )
        );
      }
    }
  }

  const data = await Target.findOneAndUpdate(
    { _id: req.params.id, ...targetScope(req) },
    { $set: { isArchived: true } },
    { new: true }
  );
  if (!data) return next(new AppError('Target not found', 404));

  await Timing.updateMany(
    { digest: { $in: ownedDigestIds }, isArchived: { $ne: true }, targets: data._id },
    { $pull: { targets: data._id } }
  );

  res.status(204).json({ status: 'success', data: null });
});

exports.getTargetsForTiming = catchAsync(async (req, res, next) => {
  const timing = await findTimingOwnedByUser(req.userId, req.params.timingId, {
    path: 'targets',
    match: notArchived,
  });

  const data = (timing.targets || []).filter(Boolean);

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});

exports.linkTargetToTiming = catchAsync(async (req, res, next) => {
  const { targetId, kindleEmail, label } = req.body || {};

  const timing = await findTimingOwnedByUser(req.userId, req.params.timingId);

  let tid = targetId;
  if (tid) {
    const exists = await Target.exists({ _id: tid, user: req.userId, ...notArchived });
    if (!exists) return next(new AppError('target not found', 404));
  } else if (kindleEmail && typeof kindleEmail === 'string') {
    const created = await Target.create({
      user: req.userId,
      kindleEmail: kindleEmail.trim().toLowerCase(),
      label,
    });
    tid = created._id;
  } else {
    return next(new AppError('targetId or kindleEmail is required', 400));
  }

  const current = (timing.targets || []).filter(Boolean).map(String);
  const tidStr = String(tid);
  if (!current.includes(tidStr)) {
    await assertDigestLinkedDevicesWithinCap(timing.digest, {
      replaceTimingId: timing._id,
      replaceWithIds: [...current, tidStr],
    });
  }

  const linkResult = await Timing.updateOne(
    { _id: req.params.timingId, ...notArchived },
    { $addToSet: { targets: tid } }
  );
  if (linkResult.matchedCount === 0) {
    return next(new AppError('Timing not found', 404));
  }

  const doc = await Target.findById(tid).lean();
  res.status(201).json({ status: 'success', data: doc });
});

exports.getTargetForTiming = catchAsync(async (req, res, next) => {
  const timing = await findTimingOwnedByUser(req.userId, req.params.timingId);
  if (!timingIncludesTarget(timing, req.params.targetId)) {
    return next(new AppError('Target not found', 404));
  }

  const data = await Target.findOne({ _id: req.params.targetId, ...targetScope(req) });
  if (!data) return next(new AppError('Target not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.updateTargetForTiming = catchAsync(async (req, res, next) => {
  const patch = targetUpdatePatchFromBody(req.body);

  const timing = await findTimingOwnedByUser(req.userId, req.params.timingId);
  if (!timingIncludesTarget(timing, req.params.targetId)) {
    return next(new AppError('Target not found', 404));
  }

  if (!(await validateKindleEmailForUpdate(patch, req.userId, req.params.targetId, next))) return;

  const data = await Target.findOneAndUpdate(
    { _id: req.params.targetId, ...targetScope(req) },
    { $set: patch },
    { new: true, runValidators: true }
  );
  if (!data) return next(new AppError('Target not found', 404));

  res.status(200).json({ status: 'success', data });
});

exports.unlinkTargetFromTiming = catchAsync(async (req, res, next) => {
  const timing = await findTimingOwnedByUser(req.userId, req.params.timingId);
  if (!timingIncludesTarget(timing, req.params.targetId)) {
    return next(new AppError('Target not found', 404));
  }

  await Timing.updateOne({ _id: timing._id }, { $pull: { targets: req.params.targetId } });

  res.status(204).json({ status: 'success', data: null });
});
