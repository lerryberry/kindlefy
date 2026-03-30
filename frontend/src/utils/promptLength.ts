import type { Prompt, PromptLength as PromptLengthType } from '../types/prompt';

export type PromptLength = PromptLengthType;

export const PROMPT_LENGTH_SEGMENT_OPTIONS: { value: PromptLength; label: string }[] = [
  { value: 'short', label: '<500 words' },
  { value: 'medium', label: '500-1500 words' },
  { value: 'long', label: '2000+ words' },
];

export function lengthLabel(length: PromptLength | string | undefined): string {
  if (!length) return '';
  const row = PROMPT_LENGTH_SEGMENT_OPTIONS.find((o) => o.value === length);
  return row?.label ?? String(length);
}

/** Single-line label for selects and list titles. */
export function formatPromptOption(p: Pick<Prompt, 'topics' | 'length'>): string {
  const topicPart = (p.topics || []).filter(Boolean).join(', ');
  const len = lengthLabel(p.length as PromptLength);
  if (topicPart && len) return `${topicPart} · ${len}`;
  if (topicPart) return topicPart;
  if (len) return len;
  return 'Prompt';
}

export function digestTitleFromPrompt(p: Prompt): string {
  const first = (p.topics || []).find(Boolean);
  if (first) return first.length > 48 ? `${first.slice(0, 45)}…` : first;
  return lengthLabel(p.length as PromptLength) || 'Digest';
}
