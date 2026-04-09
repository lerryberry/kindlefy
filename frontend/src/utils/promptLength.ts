import type { Prompt } from '../types/prompt';

export const WORD_COUNT_MIN = 500;
export const WORD_COUNT_MAX = 5000;
export const WORD_COUNT_STEP = 100;
export const DEFAULT_WORD_COUNT = 2000;

/** Snap to slider step and clamp to API range. */
export function clampWordCount(n: number): number {
  const x = Math.max(WORD_COUNT_MIN, Math.min(WORD_COUNT_MAX, Math.round(n)));
  const stepped =
    Math.round((x - WORD_COUNT_MIN) / WORD_COUNT_STEP) * WORD_COUNT_STEP + WORD_COUNT_MIN;
  return Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, stepped));
}

/** Human-readable label for UI (e.g. list rows, accordion headers). */
export function formatWordCount(length: number | undefined): string {
  if (length === undefined || length === null || Number.isNaN(length)) return '';
  return `${length.toLocaleString()} words`;
}

export function formatPromptOption(p: Pick<Prompt, 'topics' | 'length'>): string {
  const topicPart = (p.topics || []).filter(Boolean).join(', ');
  const len = formatWordCount(p.length);
  if (topicPart && len) return `${topicPart} · ${len}`;
  if (topicPart) return topicPart;
  if (len) return len;
  return 'Prompt';
}

export function digestTitleFromPrompt(p: Prompt): string {
  const first = (p.topics || []).find(Boolean);
  if (first) return first.length > 48 ? `${first.slice(0, 45)}…` : first;
  return formatWordCount(p.length) || 'Digest';
}
