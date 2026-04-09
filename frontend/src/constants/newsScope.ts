export type NewsScope = 'global' | 'country' | 'local';

export const NEWS_SCOPE_SEGMENT_OPTIONS: { value: NewsScope; label: string }[] = [
  { value: 'global', label: 'Global news' },
  { value: 'country', label: 'Country-wide' },
  { value: 'local', label: 'Local news' },
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
  if (s === 'country') return loc ? `Country · ${loc}` : 'Country-wide';
  return loc ? `Local · ${loc}` : 'Local news';
}
