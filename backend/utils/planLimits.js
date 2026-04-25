const AppError = require('./appError');
const Digest = require('../models/digestModel');
const Prompt = require('../models/promptModel');
const Timing = require('../models/timingModel');

const notArchived = { isArchived: { $ne: true } };

const MAX_DIGESTS_PER_LOGIN = 10;
const MAX_CONTENT_SECTIONS_PER_DIGEST = 5;
const MAX_KINDLE_DEVICES_PER_DIGEST = 1;

/**
 * Unique target ids linked on any non-archived timing for this digest.
 * @param {string|import('mongoose').Types.ObjectId} digestId
 * @param {{ replaceTimingId?: string|import('mongoose').Types.ObjectId|null, replaceWithIds?: string[]|null, extraTimingTargetIds?: string[]|null }} [opts]
 */
async function linkedTargetIdSetForDigest(digestId, opts = {}) {
  const { replaceTimingId, replaceWithIds, extraTimingTargetIds } = opts;
  const timings = await Timing.find({ digest: digestId, ...notArchived }).lean();
  const set = new Set();
  for (const t of timings) {
    let ids = (t.targets || []).filter(Boolean).map(String);
    if (replaceTimingId != null && String(t._id) === String(replaceTimingId)) {
      ids = (replaceWithIds || []).map(String);
    }
    ids.forEach((id) => set.add(id));
  }
  if (extraTimingTargetIds && extraTimingTargetIds.length) {
    extraTimingTargetIds.map(String).forEach((id) => set.add(id));
  }
  return set;
}

async function assertDigestCountUnderLoginCap(userId) {
  const n = await Digest.countDocuments({ user: userId, ...notArchived });
  if (n >= MAX_DIGESTS_PER_LOGIN) {
    throw new AppError(
      `You can have at most ${MAX_DIGESTS_PER_LOGIN} digests. Delete or archive one before creating another.`,
      400
    );
  }
}

async function assertDigestHasRoomForAnotherContentSection(digestId) {
  const n = await Prompt.countDocuments({ digest: digestId, ...notArchived });
  if (n >= MAX_CONTENT_SECTIONS_PER_DIGEST) {
    throw new AppError(
      `Each digest can have at most ${MAX_CONTENT_SECTIONS_PER_DIGEST} content sections.`,
      400
    );
  }
}

async function assertDigestLinkedDevicesWithinCap(digestId, opts) {
  const set = await linkedTargetIdSetForDigest(digestId, opts);
  if (set.size > MAX_KINDLE_DEVICES_PER_DIGEST) {
    throw new AppError(
      `A digest can link at most ${MAX_KINDLE_DEVICES_PER_DIGEST} Kindle devices across all its schedules.`,
      400
    );
  }
}

module.exports = {
  MAX_DIGESTS_PER_LOGIN,
  MAX_CONTENT_SECTIONS_PER_DIGEST,
  MAX_KINDLE_DEVICES_PER_DIGEST,
  notArchived,
  linkedTargetIdSetForDigest,
  assertDigestCountUnderLoginCap,
  assertDigestHasRoomForAnotherContentSection,
  assertDigestLinkedDevicesWithinCap,
};
