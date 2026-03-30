const Digest = require('../models/digestModel');
const Prompt = require('../models/promptModel');
const Timing = require('../models/timingModel');
const Target = require('../models/targetModel');
const AppError = require('./appError');

const notArchived = { isArchived: { $ne: true } };

async function getDigestOwnedByUserOrThrow(userId, digestId) {
  const digest = await Digest.findOne({ _id: digestId, user: userId, ...notArchived }).lean();
  if (!digest) {
    throw new AppError('Digest not found', 404);
  }
  return digest;
}

async function assertPromptBelongsToDigest(digestId, promptId) {
  const prompt = await Prompt.findOne({ _id: promptId, digest: digestId, ...notArchived }).lean();
  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }
  return prompt;
}

async function assertTimingBelongsToDigest(digestId, timingId) {
  const timing = await Timing.findOne({ _id: timingId, digest: digestId, ...notArchived }).lean();
  if (!timing) {
    throw new AppError('Timing not found', 404);
  }
  return timing;
}

async function assertTargetsOwned(userId, ids) {
  if (!ids || !ids.length) return true;
  const unique = [...new Set(ids.map((id) => String(id)))];
  const count = await Target.countDocuments({
    _id: { $in: unique },
    user: userId,
    ...notArchived,
  });
  return count === unique.length;
}

module.exports = {
  getDigestOwnedByUserOrThrow,
  assertPromptBelongsToDigest,
  assertTimingBelongsToDigest,
  assertTargetsOwned,
};

