const AppError = require('./appError');
const { sanitizeText } = require('../middleware/sanitize');

const SCOPES = new Set(['global', 'country', 'local', 'special']);
const MAX_LOCATION_LEN = 500;

function buildLocalisationPromptText(scope, text) {
  if (scope === 'global' || scope === 'special') return 'globally';
  const normalizedText = typeof text === 'string' ? text.trim() : '';
  return `local to ${normalizedText}`;
}

function assertValidScope(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return 'global';
  const s = String(raw).trim();
  if (!SCOPES.has(s)) {
    throw new AppError('newsScope must be global, country, local, or special', 400);
  }
  return s;
}

/**
 * @param {string} scope
 * @param {unknown} locationText
 */
function normalizeLocationForScope(scope, locationText) {
  if (scope === 'global' || scope === 'special') {
    return null;
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

function normalizeCoordinates(raw) {
  if (!raw || typeof raw !== 'object') return { lat: null, lng: null };
  const lat = typeof raw.lat === 'number' && isFinite(raw.lat) ? raw.lat : null;
  const lng = typeof raw.lng === 'number' && isFinite(raw.lng) ? raw.lng : null;
  return { lat, lng };
}

function normalizeTimezone(raw) {
  if (typeof raw === 'string' && raw.trim().length > 0) return raw.trim().slice(0, 100);
  return null;
}

function pickLocalisationInput(body) {
  if (body?.localisation && typeof body.localisation === 'object') return body.localisation;
  return {
    scope: body?.newsScope,
    text: body?.locationText,
    coordinates: body?.locationCoordinates,
    timezone: body?.locationTimezone,
  };
}

function normalizeForScope(scope, draft) {
  const text = normalizeLocationForScope(scope, draft?.text);
  const coordinates =
    scope === 'global' || scope === 'special' ? { lat: null, lng: null } : normalizeCoordinates(draft?.coordinates);
  const timezone = scope === 'global' || scope === 'special' ? null : normalizeTimezone(draft?.timezone);
  const promptText = buildLocalisationPromptText(scope, text);
  return { scope, text, coordinates, timezone, promptText };
}

function normalizeNewsScopeForCreate(body) {
  const source = pickLocalisationInput(body);
  const scope = assertValidScope(source?.scope);
  return { localisation: normalizeForScope(scope, source) };
}

function localisationFromExisting(existing) {
  if (existing?.localisation && typeof existing.localisation === 'object') {
    const existingScope = assertValidScope(existing.localisation.scope || 'global');
    const text = existing.localisation.text ?? null;
    const promptText =
      typeof existing.localisation.promptText === 'string' && existing.localisation.promptText.trim()
        ? existing.localisation.promptText.trim()
        : buildLocalisationPromptText(existingScope, text);
    return {
      scope: existingScope,
      text,
      coordinates: normalizeCoordinates(existing.localisation.coordinates),
      timezone: normalizeTimezone(existing.localisation.timezone),
      promptText,
    };
  }
  const legacyScope = assertValidScope(existing?.newsScope || 'global');
  const text = existing?.locationText ?? null;
  return {
    scope: legacyScope,
    text,
    coordinates: normalizeCoordinates(existing?.locationCoordinates),
    timezone: normalizeTimezone(existing?.locationTimezone),
    promptText: buildLocalisationPromptText(legacyScope, text),
  };
}

function normalizeNewsScopeForUpdate(body, existing) {
  const hasNested = Object.prototype.hasOwnProperty.call(body, 'localisation');
  const hasScope = Object.prototype.hasOwnProperty.call(body, 'newsScope');
  const hasLoc = Object.prototype.hasOwnProperty.call(body, 'locationText');
  const hasCoords = Object.prototype.hasOwnProperty.call(body, 'locationCoordinates');
  const hasTz = Object.prototype.hasOwnProperty.call(body, 'locationTimezone');

  if (!hasNested && !hasScope && !hasLoc && !hasCoords && !hasTz) {
    return null;
  }

  const existingLoc = localisationFromExisting(existing);
  const nestedBody = hasNested && body.localisation && typeof body.localisation === 'object' ? body.localisation : {};
  const hasNestedScope = hasNested && Object.prototype.hasOwnProperty.call(nestedBody, 'scope');
  const hasNestedText = hasNested && Object.prototype.hasOwnProperty.call(nestedBody, 'text');
  const hasNestedCoords = hasNested && Object.prototype.hasOwnProperty.call(nestedBody, 'coordinates');
  const hasNestedTz = hasNested && Object.prototype.hasOwnProperty.call(nestedBody, 'timezone');

  const scope = hasNestedScope
    ? assertValidScope(nestedBody.scope)
    : hasScope
      ? assertValidScope(body.newsScope)
      : existingLoc.scope;

  const draft = {
    text: hasNestedText ? nestedBody.text : hasLoc ? body.locationText : existingLoc.text,
    coordinates: hasNestedCoords
      ? nestedBody.coordinates
      : hasCoords
        ? body.locationCoordinates
        : existingLoc.coordinates,
    timezone: hasNestedTz ? nestedBody.timezone : hasTz ? body.locationTimezone : existingLoc.timezone,
  };

  return { localisation: normalizeForScope(scope, draft) };
}

module.exports = {
  buildLocalisationPromptText,
  normalizeNewsScopeForCreate,
  normalizeNewsScopeForUpdate,
};
