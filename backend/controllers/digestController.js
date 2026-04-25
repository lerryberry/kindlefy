const Digest = require('../models/digestModel');
const Prompt = require('../models/promptModel');
const Timing = require('../models/timingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { normalizePromptTopics } = require('../utils/normalizePromptTopics');
const {
  buildLocalisationPromptText,
  normalizeNewsScopeForCreate,
  normalizeNewsScopeForUpdate,
} = require('../utils/normalizeNewsScope');
const {
  getDigestOwnedByUserOrThrow,
  assertPromptBelongsToDigest,
  assertTimingBelongsToDigest,
  assertTargetsOwned,
} = require('../utils/digestOwnership');

const { parseWordCount } = require('../utils/wordCount');
const {
  assertDigestCountUnderLoginCap,
  assertDigestHasRoomForAnotherContentSection,
  assertDigestLinkedDevicesWithinCap,
} = require('../utils/planLimits');
const notArchived = { isArchived: { $ne: true } };

function normalizeExistingLocalisation(prompt) {
  if (prompt?.localisation && typeof prompt.localisation === 'object') {
    const scope = prompt.localisation.scope || 'global';
    const text = prompt.localisation.text ?? null;
    const promptText =
      typeof prompt.localisation.promptText === 'string' && prompt.localisation.promptText.trim()
        ? prompt.localisation.promptText.trim()
        : buildLocalisationPromptText(scope, text);
    return {
      scope,
      text,
      coordinates: prompt.localisation.coordinates || { lat: null, lng: null },
      timezone: prompt.localisation.timezone ?? null,
      promptText,
    };
  }
  const scope = prompt?.newsScope || 'global';
  const text = prompt?.locationText || null;
  return {
    scope,
    text,
    coordinates: prompt?.locationCoordinates || { lat: null, lng: null },
    timezone: prompt?.locationTimezone || null,
    promptText: buildLocalisationPromptText(scope, text),
  };
}

function serializeContentItem(prompt) {
  const localisation = normalizeExistingLocalisation(prompt);
  return {
    contentId: prompt._id,
    order: prompt.order,
    length: prompt.length,
    topics: prompt.topics || [],
    newsScope: localisation.scope,
    locationText: localisation.text || '',
    locationCoordinates: localisation.coordinates || { lat: null, lng: null },
    locationTimezone: localisation.timezone || '',
    localisation,
  };
}

function serializeDigestPrompt(prompt) {
  if (!prompt) {
    return {
      length: undefined,
      topics: [],
      newsScope: undefined,
      locationText: undefined,
      locationCoordinates: undefined,
      locationTimezone: undefined,
      localisation: undefined,
    };
  }
  const localisation = normalizeExistingLocalisation(prompt);
  return {
    length: prompt.length,
    topics: prompt.topics || [],
    newsScope: localisation.scope,
    locationText: localisation.text || '',
    locationCoordinates: localisation.coordinates || { lat: null, lng: null },
    locationTimezone: localisation.timezone || '',
    localisation,
  };
}

function sanitizeDigestSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return null;
  const timezone = schedule.timezone;
  const timeOfDay = schedule.timeOfDay;
  const frequency = schedule.frequency;
  if (typeof timezone !== 'string' || typeof timeOfDay !== 'string') return null;
  const t = timeOfDay.trim();
  if (!/^([01]\d|2[0-3]):(00|30)$/.test(t)) return null;
  return {
    timezone: timezone.trim(),
    timeOfDay: t,
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
  const contentCountByDigestId = new Map();
  for (const p of prompts) {
    const did = String(p.digest);
    contentCountByDigestId.set(did, (contentCountByDigestId.get(did) || 0) + 1);
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
    enabled: d.enabled !== false,
    contentCount: contentCountByDigestId.get(String(d._id)) || 0,
    prompt: serializeDigestPrompt(firstPromptByDigestId.get(String(d._id))),
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

  const wordCount = parseWordCount(length);
  if (wordCount === null) {
    return next(new AppError('length must be an integer word count between 500 and 5000', 400));
  }

  const normalizedTopics = normalizePromptTopics(topics ?? [], { minSelected: 1 });
  const { localisation } = normalizeNewsScopeForCreate(req.body || {});

  await assertDigestCountUnderLoginCap(req.userId);

  const digest = await Digest.create({ user: req.userId });
  const prompt = await Prompt.create({
    digest: digest._id,
    order: 0,
    length: wordCount,
    topics: normalizedTopics,
    localisation,
  });

  res.status(201).json({
    status: 'success',
    data: {
      digestId: digest._id,
      contentId: prompt._id,
      prompt: serializeDigestPrompt(prompt),
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
    data: prompts.map((p) => serializeContentItem(p)),
  });
});

exports.createDigestContentItem = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  const { length, topics } = req.body || {};
  const wordCount = parseWordCount(length);
  if (wordCount === null) {
    return next(new AppError('length must be an integer word count between 500 and 5000', 400));
  }

  await assertDigestHasRoomForAnotherContentSection(digestId);

  const normalizedTopics = normalizePromptTopics(topics ?? [], { minSelected: 1 });
  const { localisation } = normalizeNewsScopeForCreate(req.body || {});

  const maxPrompt = await Prompt.findOne({ digest: digestId, ...notArchived }).sort({ order: -1, createdAt: -1 }).lean();
  const order = maxPrompt ? maxPrompt.order + 1 : 0;

  const prompt = await Prompt.create({
    digest: digestId,
    order,
    length: wordCount,
    topics: normalizedTopics,
    localisation,
  });

  res.status(201).json({
    status: 'success',
    data: serializeContentItem(prompt),
  });
});

exports.updateDigestContentItem = catchAsync(async (req, res, next) => {
  const { digestId, contentId } = req.params;

  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  // Will throw 404 if prompt does not exist / does not belong to digest / is archived
  const existingPrompt = await assertPromptBelongsToDigest(digestId, contentId);

  const patch = {};
  const body = req.body || {};

  if (Object.prototype.hasOwnProperty.call(body, 'length')) {
    const wordCount = parseWordCount(body.length);
    if (wordCount === null) {
      return next(new AppError('length must be an integer word count between 500 and 5000', 400));
    }
    patch.length = wordCount;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'topics')) {
    patch.topics = normalizePromptTopics(body.topics ?? [], { minSelected: 1 });
  }

  const newsPatch = normalizeNewsScopeForUpdate(body, existingPrompt);
  if (newsPatch) {
    patch.localisation = newsPatch.localisation;
  }

  if (Object.keys(patch).length === 0) {
    return next(new AppError('No valid fields provided', 400));
  }

  const update = { $set: patch };
  if (newsPatch) {
    update.$unset = { newsScope: '', locationText: '', locationCoordinates: '', locationTimezone: '' };
  }

  const prompt = await Prompt.findOneAndUpdate(
    { _id: contentId, digest: digestId, ...notArchived },
    update,
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: serializeContentItem(prompt),
  });
});

exports.deleteDigestContentItem = catchAsync(async (req, res, next) => {
  const { digestId, contentId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  // Throws if not found / not owned / archived
  await assertPromptBelongsToDigest(digestId, contentId);

  const activeCount = await Prompt.countDocuments({ digest: digestId, ...notArchived });
  if (activeCount === 1) {
    const digest = await Digest.findOne({ _id: digestId, user: req.userId, ...notArchived }).lean();
    if (digest && digest.enabled !== false) {
      return next(
        new AppError('Turn this digest off before removing its last content section.', 400)
      );
    }
  }

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
    data: updated.map((p) => serializeContentItem(p)),
  });
});

exports.getDigestTimings = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  const timings = await Timing.find({ digest: digestId, ...notArchived })
    .sort({ createdAt: -1 })
    .lean();

  const linkedSet = new Set();
  for (const t of timings) {
    for (const id of (t.targets || []).filter(Boolean)) {
      linkedSet.add(String(id));
    }
  }

  res.status(200).json({
    status: 'success',
    results: timings.length,
    digestLinkedTargetIds: [...linkedSet],
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

  await assertDigestLinkedDevicesWithinCap(digestId, {
    replaceTimingId: timingId,
    replaceWithIds: uniqueIds,
  });

  if (uniqueIds.length === 0) {
    const digest = await Digest.findOne({ _id: digestId, user: req.userId, ...notArchived }).lean();
    if (digest && digest.enabled !== false) {
      return next(
        new AppError('Turn this digest off before removing the last Kindle from this schedule.', 400)
      );
    }
  }

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

exports.updateDigestEnabled = catchAsync(async (req, res, next) => {
  const { digestId } = req.params;
  await getDigestOwnedByUserOrThrow(req.userId, digestId);

  if (!Object.prototype.hasOwnProperty.call(req.body || {}, 'enabled')) {
    return next(new AppError('enabled is required', 400));
  }

  if (typeof req.body.enabled !== 'boolean') {
    return next(new AppError('enabled must be a boolean', 400));
  }

  if (req.body.enabled === true) {
    const hasContent = await Prompt.exists({ digest: digestId, ...notArchived });
    if (!hasContent) {
      return next(new AppError('Add at least one content section before turning this digest on.', 400));
    }
    const timings = await Timing.find({ digest: digestId, ...notArchived }).lean();
    const canSend = timings.some(
      (t) =>
        sanitizeDigestSchedule(t.schedule) &&
        (t.targets || []).filter(Boolean).length > 0
    );
    if (!canSend) {
      return next(
        new AppError(
          'Save a schedule with a send time and link at least one Kindle before turning this digest on.',
          400
        )
      );
    }
  }

  const digest = await Digest.findOneAndUpdate(
    { _id: digestId, user: req.userId, ...notArchived },
    { $set: { enabled: req.body.enabled } },
    { new: true }
  ).lean();

  res.status(200).json({
    status: 'success',
    data: {
      digestId: digest._id,
      enabled: digest.enabled !== false,
    },
  });
});

