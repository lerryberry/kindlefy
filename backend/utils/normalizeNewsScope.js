const AppError = require('./appError');
const { sanitizeText } = require('../middleware/sanitize');

const SCOPES = new Set(['global', 'country', 'local']);
const MAX_LOCATION_LEN = 500;

function assertValidScope(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return 'global';
  const s = String(raw).trim();
  if (!SCOPES.has(s)) {
    throw new AppError('newsScope must be global, country, or local', 400);
  }
  return s;
}

/**
 * @param {string} scope
 * @param {unknown} locationText
 */
function normalizeLocationForScope(scope, locationText) {
  if (scope === 'global') {
    return '';
  }
  if (locationText === undefined || locationText === null || String(locationText).trim() === '') {
    throw new AppError('locationText is required when news scope is country-wide or local', 400);
  }
  const t = sanitizeText(String(locationText)).trim();
  if (t.length < 2) {
    throw new AppError('Enter a town or area (at least 2 characters)', 400);
  }
  if (t.length > MAX_LOCATION_LEN) {
    throw new AppError(`locationText must be ${MAX_LOCATION_LEN} characters or less`, 400);
  }
  return t;
}

function normalizeNewsScopeForCreate(body) {
  const scope = assertValidScope(body?.newsScope);
  const locationText = normalizeLocationForScope(scope, body?.locationText);
  return { newsScope: scope, locationText };
}

/**
 * @param {object} body - request body (partial ok)
 * @param {object} existing - lean prompt doc
 */
function normalizeNewsScopeForUpdate(body, existing) {
  const hasScope = Object.prototype.hasOwnProperty.call(body, 'newsScope');
  const hasLoc = Object.prototype.hasOwnProperty.call(body, 'locationText');

  if (!hasScope && !hasLoc) {
    return null;
  }

  const scope = hasScope ? assertValidScope(body.newsScope) : existing.newsScope || 'global';
  const locInput = hasLoc ? body.locationText : existing.locationText;
  const locationText = normalizeLocationForScope(scope, locInput);
  return { newsScope: scope, locationText };
}

module.exports = {
  normalizeNewsScopeForCreate,
  normalizeNewsScopeForUpdate,
};
