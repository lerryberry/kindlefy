import type { DigestListItem } from '../types/digest';

export type EnableRequirement = 'content' | 'schedule' | 'kindle';

export function digestHasRunnableSchedule(digest: Pick<DigestListItem, 'defaultTiming'>): boolean {
  const s = digest.defaultTiming?.schedule;
  if (!s || typeof s.timeOfDay !== 'string' || typeof s.timezone !== 'string') return false;
  return Boolean(s.timeOfDay.trim() && s.timezone.trim());
}

export function missingEnableRequirements(digest: DigestListItem): EnableRequirement[] {
  const missing: EnableRequirement[] = [];
  if ((digest.contentCount ?? 0) < 1) missing.push('content');
  if (!digestHasRunnableSchedule(digest)) missing.push('schedule');
  if ((digest.defaultTiming?.targetsCount ?? 0) < 1) missing.push('kindle');
  return missing;
}

export function canEnableDigest(digest: DigestListItem): boolean {
  return missingEnableRequirements(digest).length === 0;
}
