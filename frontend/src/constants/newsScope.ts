export type NewsScope = 'global' | 'country' | 'local' | 'special';

export const NEWS_SCOPE_SEGMENT_OPTIONS: { value: NewsScope; label: string }[] = [
  { value: 'global', label: 'Global news' },
  { value: 'country', label: 'Country-wide news' },
  { value: 'local', label: 'Local news' },
  { value: 'special', label: 'Special interest' },
];

export const DEFAULT_NEWS_SCOPE: NewsScope = 'global';

/** Short label for accordion rows and digest list. */
export function formatNewsScopeSummary(
  newsScope: NewsScope | undefined,
  locationText: string | undefined
): string {
  const s = newsScope ?? 'global';
  const loc = (locationText || '').trim();
  if (s === 'global') return 'Global news';
  if (s === 'special') return 'Special interest';
  if (s === 'country') return loc ? `Country · ${loc}` : 'Country-wide';
  return loc ? `Local · ${loc}` : 'Local news';
}
