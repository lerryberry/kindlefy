/** Target word count for digest content (stored on Prompt.length). */
const MIN_WORD_COUNT = 500;
const MAX_WORD_COUNT = 5000;

/**
 * Parse and validate word count from request body (JSON number or integer string).
 * @returns {number|null} Valid integer in range, or null.
 */
function parseWordCount(raw) {
  let n;
  if (typeof raw === 'number') {
    n = raw;
  } else if (typeof raw === 'string' && /^-?\d+$/.test(raw.trim())) {
    n = parseInt(raw.trim(), 10);
  } else {
    return null;
  }
  if (!Number.isInteger(n) || n < MIN_WORD_COUNT || n > MAX_WORD_COUNT) {
    return null;
  }
  return n;
}

module.exports = {
  MIN_WORD_COUNT,
  MAX_WORD_COUNT,
  parseWordCount,
};
