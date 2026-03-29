const AppError = require('./appError');
const PROMPT_TOPIC_CHIPS = require('../constants/promptTopics');
const { sanitizeText } = require('../middleware/sanitize');

const allowed = new Set(PROMPT_TOPIC_CHIPS);

/**
 * @param {unknown} topics
 * @param {{ minSelected?: number }} [opts]
 * @returns {string[]|undefined} normalized list, or undefined if topics is undefined
 */
function normalizePromptTopics(topics, opts = {}) {
  const { minSelected = 0 } = opts;
  if (topics === undefined) return undefined;
  if (!Array.isArray(topics)) {
    throw new AppError('topics must be an array of strings', 400);
  }
  const out = [];
  for (const t of topics) {
    if (typeof t !== 'string') {
      throw new AppError('topics must be an array of strings', 400);
    }
    const s = sanitizeText(t);
    if (!allowed.has(s)) {
      throw new AppError('topics must only include preset digest topic chips', 400);
    }
    if (!out.includes(s)) out.push(s);
  }
  if (out.length < minSelected) {
    throw new AppError('select at least one topic', 400);
  }
  return out;
}

module.exports = { normalizePromptTopics };
