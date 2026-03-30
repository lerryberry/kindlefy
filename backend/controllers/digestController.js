const Digest = require('../models/digestModel');
const Prompt = require('../models/promptModel');
const Timing = require('../models/timingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { normalizePromptTopics } = require('../utils/normalizePromptTopics');
const {
  getDigestOwnedByUserOrThrow,
  assertPromptBelongsToDigest,
  assertTimingBelongsToDigest,
  assertTargetsOwned,
} = require('../utils/digestOwnership');

const ALLOWED_LENGTHS = ['short', 'medium', 'long'];
const notArchived = { isArchived: { $ne: true } };

function sanitizeDigestSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return null;
  const timezone = schedule.timezone;
  const timeOfDay = schedule.timeOfDay;
  const frequency = schedule.frequency;
  if (typeof timezone !== 'string' || typeof timeOfDay !== 'string') return null;
  return {
    timezone: timezone.trim(),
    timeOfDay: timeOfDay.trim(),
    frequency: typeof frequency === 'string' ? frequency.trim() : undefined,
  };
}

exports.getDigests = catchAsync(async (req, res) => {
  const digests = await Digest.find({ ...notArchived, user: req.userId }).lean();

  const digestIds = digests.map((d) => d._id);
  const prompts = await Prompt.find({ digest: { $in: digestIds }, ...notArchived })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const firstPromptByDigestId = new Map();
  for (const p of prompts) {
    const did = String(p.digest);
    if (!firstPromptByDigestId.has(did)) {
      firstPromptByDigestId.set(did, p);
    }
  }

  const timings = await Timing.find({ digest: { $in: digestIds }, ...notArchived })
    .sort({ createdAt: -1 })
    .lean();

  const firstTimingByDigestId = new Map();
  for (const t of timings) {
    const did = String(t.digest);
    if (!firstTimingByDigestId.has(did)) {
      firstTimingByDigestId.set(did, {
        timingId: t._id,
        schedule: t.schedule,
        targetsCount: (t.targets || []).filter(Boolean).length,
      });
    }
  }

  const data = digests.map((d) => ({
    _id: d._id,
    prompt: firstPromptByDigestId.get(String(d._id))
      ? {
          length: firstPromptByDigestId.get(String(d._id)).length,
          topics: firstPromptByDigestId.get(String(d._id)).topics || [],
        }
      : { length: undefined, topics: [] },
    defaultTiming: firstTimingByDigestId.get(String(d._id)) || null,
  }));

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});

exports.createDigestFromContent = catchAsync(async (req, res, next) => {
  const { length, topics } = req.body || {};

  if (!length || typeof length !== 'string' || !ALLOWED_LENGTHS.includes(length)) {
    return next(new AppError('length must be short, medium, or long', 400));
  }

  const normalizedTopics = normalizePromptTopics(topics ?? [], { minSelected: 1 });

  const digest = await Digest.create({ user: req.userId });
  const prompt = await Prompt.create({
    digest: digest._id,
    order: 0,
    length,
    topics: normalizedTopics,
  });

  res.status(201).json({
    status: 'success',
    data: {
      digestId: digest._id,
      contentId: prompt._id,
      prompt: { length: prompt.length, topics: prompt.topics || [] },
    },
  });
});

exports.getDigestContents = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  const prompts = await Prompt.find({ digest: digestId, ...notArchived }).sort({ order: 1, createdAt: 1 }).lean();

  res.status(200).json({
    status: 'success',
    results: prompts.length,
    data: prompts.map((p) => ({
      contentId: p._id,
      order: p.order,
      length: p.length,
      topics: p.topics || [],
    })),
  });
});

exports.createDigestContentItem = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  const { length, topics } = req.body || {};
  if (!length || typeof length !== 'string' || !ALLOWED_LENGTHS.includes(length)) {
    return next(new AppError('length must be short, medium, or long', 400));
  }

  const normalizedTopics = normalizePromptTopics(topics ?? [], { minSelected: 1 });

  const maxPrompt = await Prompt.findOne({ digest: digestId, ...notArchived }).sort({ order: -1, createdAt: -1 }).lean();
  const order = maxPrompt ? maxPrompt.order + 1 : 0;

  const prompt = await Prompt.create({
    digest: digestId,
    order,
    length,
    topics: normalizedTopics,
  });

  res.status(201).json({
    status: 'success',
    data: {
      contentId: prompt._id,
      order: prompt.order,
      length: prompt.length,
      topics: prompt.topics || [],
    },
  });
});

exports.updateDigestContentItem = catchAsync(async (req, res, next) => {
  const { digestId, contentId } = req.params;

  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  // Will throw 404 if prompt does not exist / does not belong to digest / is archived
  await assertPromptBelongsToDigest(digestId, contentId);

  const patch = {};
  const body = req.body || {};

  if (Object.prototype.hasOwnProperty.call(body, 'length')) {
    if (!body.length || typeof body.length !== 'string' || !ALLOWED_LENGTHS.includes(body.length)) {
      return next(new AppError('length must be short, medium, or long', 400));
    }
    patch.length = body.length;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'topics')) {
    patch.topics = normalizePromptTopics(body.topics ?? [], { minSelected: 1 });
  }

  if (Object.keys(patch).length === 0) {
    return next(new AppError('No valid fields provided', 400));
  }

  const prompt = await Prompt.findOneAndUpdate(
    { _id: contentId, digest: digestId, ...notArchived },
    { $set: patch },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      contentId: prompt._id,
      order: prompt.order,
      length: prompt.length,
      topics: prompt.topics || [],
    },
  });
});

exports.deleteDigestContentItem = catchAsync(async (req, res, next) => {
  const { digestId, contentId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  // Throws if not found / not owned / archived
  await assertPromptBelongsToDigest(digestId, contentId);

  await Prompt.updateOne({ _id: contentId, digest: digestId, ...notArchived }, { $set: { isArchived: true } });

  // Resequence remaining active content items
  const remaining = await Prompt.find({ digest: digestId, ...notArchived }).sort({ order: 1, createdAt: 1 }).lean();
  if (remaining.length > 0) {
    const ops = remaining.map((p, index) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { order: index } },
      },
    }));
    await Prompt.bulkWrite(ops);
  }

  res.status(204).json({ status: 'success' });
});

exports.reorderDigestContents = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  const body = req.body || {};
  const ids = body.contentIds === undefined ? undefined : body.contentIds;
  if (ids === undefined || ids === null) {
    return next(new AppError('contentIds is required', 400));
  }
  if (!Array.isArray(ids)) {
    return next(new AppError('contentIds must be an array', 400));
  }

  const uniqueIds = [...new Set(ids.map((id) => String(id)))];
  if (uniqueIds.length === 0) {
    return next(new AppError('contentIds cannot be empty', 400));
  }

  const existing = await Prompt.find({
    _id: { $in: uniqueIds },
    digest: digestId,
    ...notArchived,
  }).select('_id order').lean();

  if (existing.length !== uniqueIds.length) {
    return next(new AppError('one or more content items not found', 404));
  }

  const ops = uniqueIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, digest: digestId, ...notArchived },
      update: { $set: { order: index } },
    },
  }));
  await Prompt.bulkWrite(ops);

  const updated = await Prompt.find({ digest: digestId, ...notArchived }).sort({ order: 1, createdAt: 1 }).lean();

  res.status(200).json({
    status: 'success',
    results: updated.length,
    data: updated.map((p) => ({
      contentId: p._id,
      order: p.order,
      length: p.length,
      topics: p.topics || [],
    })),
  });
});

exports.getDigestTimings = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  const timings = await Timing.find({ digest: digestId, ...notArchived })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: timings.length,
    data: timings.map((t) => ({
      timingId: t._id,
      schedule: t.schedule,
      targetsCount: (t.targets || []).filter(Boolean).length,
    })),
  });
});

exports.createDigestTiming = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  const digest = await getDigestOwnedByUserOrThrow(req.userId, digestId);

  const hasContent = await Prompt.exists({ digest: digestId, ...notArchived });
  if (!hasContent) return next(new AppError('Content not found', 404));

  const schedule = sanitizeDigestSchedule(req.body?.schedule);
  if (!schedule) return next(new AppError('schedule is required', 400));

  const timing = await Timing.create({
    digest: digestId,
    schedule,
    targets: [],
  });

  res.status(201).json({
    status: 'success',
    data: {
      timingId: timing._id,
      schedule: timing.schedule,
      targetsCount: 0,
    },
  });
});

exports.updateDigestTimingSchedule = catchAsync(async (req, res, next) => {
  const { digestId, timingId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);
  await assertTimingBelongsToDigest(digestId, timingId);

  const schedule = sanitizeDigestSchedule(req.body?.schedule);
  if (!schedule) return next(new AppError('schedule is required', 400));

  const timing = await Timing.findOneAndUpdate(
    { _id: timingId, digest: digestId, ...notArchived },
    { $set: { schedule } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      timingId: timing._id,
      schedule: timing.schedule,
      targetsCount: (timing.targets || []).filter(Boolean).length,
    },
  });
});

exports.getDigestTimingTargets = catchAsync(async (req, res, next) => {
  const { digestId, timingId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  await assertTimingBelongsToDigest(digestId, timingId);
  const timing = await Timing.findOne({ _id: timingId, digest: digestId, ...notArchived })
    .populate({ path: 'targets', match: notArchived })
    .lean();

  res.status(200).json({
    status: 'success',
    results: (timing.targets || []).length,
    data: timing.targets || [],
  });
});

exports.updateDigestTimingTargets = catchAsync(async (req, res, next) => {
  const { digestId, timingId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);
  await assertTimingBelongsToDigest(digestId, timingId);

  const targetList = req.body?.targets === undefined ? undefined : req.body.targets;
  const ids = targetList === null ? [] : targetList;
  if (!Array.isArray(ids)) {
    return next(new AppError('targets must be an array of target ids', 400));
  }

  if (!(await assertTargetsOwned(req.userId, ids))) {
    return next(new AppError('one or more targets not found', 404));
  }

  const uniqueIds = [...new Set(ids.map((id) => String(id)))];

  await Timing.updateOne(
    { _id: timingId, digest: digestId, ...notArchived },
    { $set: { targets: uniqueIds } }
  );

  const updated = await Timing.findOne({ _id: timingId, digest: digestId, ...notArchived })
    .populate({ path: 'targets', match: notArchived })
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      timingId,
      targets: updated.targets || [],
    },
  });
});

exports.deleteDigest = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  // Throws 404 if digest doesn’t exist, isn’t owned by user, or is already archived.
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  await Digest.findOneAndUpdate(
    { _id: digestId, user: req.userId, ...notArchived },
    { $set: { isArchived: true } },
    { new: true }
  );

  res.status(204).json({ status: 'success' });
});

