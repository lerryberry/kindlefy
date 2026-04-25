import type { DigestListItem } from '../types/digest';
import { formatNewsScopeSummary } from '../constants/newsScope';

function firstWord(text: string | undefined): string {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';
  const first = trimmed.split(/\s+/)[0] || '';
  return first.replace(/[,;:.]+$/, '');
}

function scheduleLabel(digest: DigestListItem): string {
  const s = digest.defaultTiming?.schedule;
  if (!s) return 'No schedule yet';
  const freq = s.frequency || 'daily';
  const freqLabel = freq.charAt(0).toUpperCase() + freq.slice(1);
  return `${freqLabel} at ${s.timeOfDay}`;
}

function topicsLabel(digest: DigestListItem): string {
  const topics = (digest.prompt.topics || []).filter(Boolean).slice(0, 3);
  return topics.join(', ');
}

/** Same single-line summary as the digest list row. */
export function digestTagline(digest: DigestListItem): string {
  const locationLabel = firstWord(digest.prompt.locationText);
  return [topicsLabel(digest), formatNewsScopeSummary(digest.prompt.newsScope, locationLabel), scheduleLabel(digest)]
    .filter(Boolean)
    .join(' · ');
}
