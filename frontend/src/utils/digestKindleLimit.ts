import { MAX_KINDLE_DEVICES_PER_DIGEST } from '../constants/planLimits';

/**
 * After replacing this schedule's Kindles with `proposedTimingTargetIds`, would the digest
 * exceed the unique-device cap? Uses the server-provided digest-wide id list and the current
 * schedule's selection so edits to one schedule don't double-count its old links.
 */
export function wouldExceedDigestKindleCap(
  digestLinkedTargetIds: string[],
  currentTimingTargetIds: string[],
  proposedTimingTargetIds: string[]
): boolean {
  const set = new Set(digestLinkedTargetIds);
  for (const id of currentTimingTargetIds) set.delete(id);
  for (const id of proposedTimingTargetIds) set.add(id);
  return set.size > MAX_KINDLE_DEVICES_PER_DIGEST;
}
