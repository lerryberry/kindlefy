const AppError = require('./appError');
const PROMPT_TOPIC_CHIPS = require('../constants/promptTopics');
const { sanitizeText } = require('../middleware/sanitize');

const allowed = new Set(PROMPT_TOPIC_CHIPS);
const MAX_SPECIAL_WORDS = 15;
const NEWS_SUFFIX = ' news';

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * @param {unknown} topics
 * @param {{ minSelected?: number, appendNewsToPreset?: boolean }} [opts]
 * @returns {string[]|undefined} normalized list, or undefined if topics is undefined
 */
function normalizePromptTopics(topics, opts = {}) {
  const { minSelected = 0, appendNewsToPreset = false } = opts;
  if (topics === undefined) return undefined;
  if (!Array.isArray(topics)) {
    throw new AppError('topics must be an array of strings', 400);
  }
  const out = [];
  let customCount = 0;
  for (const t of topics) {
    if (typeof t !== 'string') {
      throw new AppError('topics must be an array of strings', 400);
    }
    const s = sanitizeText(t).trim();
    if (!s) continue;
    const lower = s.toLowerCase();
    const presetTopic = allowed.has(s)
      ? s
      : lower.endsWith(NEWS_SUFFIX)
        ? (() => {
            const withoutNews = s.slice(0, -NEWS_SUFFIX.length).trim();
            return allowed.has(withoutNews) ? withoutNews : null;
          })()
        : null;
    if (!presetTopic) {
      customCount += 1;
      if (customCount > 1) {
        throw new AppError('only one custom special-interest topic is allowed', 400);
      }
      const words = countWords(s);
      if (words > MAX_SPECIAL_WORDS) {
        throw new AppError(`special-interest topic must be ${MAX_SPECIAL_WORDS} words or fewer`, 400);
      }
      if (!out.includes(s)) out.push(s);
      continue;
    }
    const normalizedPreset = appendNewsToPreset ? `${presetTopic}${NEWS_SUFFIX}` : presetTopic;
    if (!out.includes(normalizedPreset)) out.push(normalizedPreset);
  }
  if (out.length < minSelected) {
    throw new AppError('select at least one topic', 400);
  }
  return out;
}

module.exports = { normalizePromptTopics };
