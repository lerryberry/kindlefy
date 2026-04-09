/**
 * Build a single plain-text location line for AI / digests from Places API (New)
 * addressComponents. Omits street number, route, premise, postal codes, etc.
 */

const SKIP_TYPES = new Set([
  'street_number',
  'route',
  'premise',
  'subpremise',
  'plus_code',
  'floor',
  'room',
  'establishment',
  'street_address',
  'intersection',
  'postal_code',
  'postal_code_prefix',
  'postal_code_suffix',
]);

/** Prefer longText (Places API v1) then legacy long_name. */
function componentText(c) {
  if (!c) return '';
  return (c.longText || c.long_name || '').trim();
}

/**
 * @param {Array<{ longText?: string, long_name?: string, types?: string[] }>} components
 * @returns {string}
 */
function buildPlainTextFromAddressComponents(components) {
  if (!Array.isArray(components) || components.length === 0) return '';

  const firstOfType = {};
  for (const c of components) {
    const text = componentText(c);
    if (!text) continue;
    for (const t of c.types || []) {
      if (SKIP_TYPES.has(t)) continue;
      if (!firstOfType[t]) firstOfType[t] = text;
    }
  }

  const townKeys = [
    'locality',
    'postal_town',
    'sublocality',
    'sublocality_level_1',
    'neighborhood',
    'administrative_area_level_2',
  ];

  let town = '';
  for (const k of townKeys) {
    if (firstOfType[k]) {
      town = firstOfType[k];
      break;
    }
  }

  const admin1 = firstOfType.administrative_area_level_1 || '';
  const country = firstOfType.country || '';

  const parts = [];
  if (town) parts.push(town);
  if (admin1) parts.push(admin1);
  if (country) parts.push(country);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  if (country) return country;

  const fallbacks = [
    'administrative_area_level_1',
    'administrative_area_level_3',
    'colloquial_area',
  ];
  for (const k of fallbacks) {
    if (firstOfType[k]) return firstOfType[k];
  }

  return '';
}

module.exports = { buildPlainTextFromAddressComponents };
