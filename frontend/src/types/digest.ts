import type { PromptLength } from './prompt';
import type { Schedule } from './timing';
import type { Target } from './target';

export interface DigestPrompt {
  length: PromptLength;
  topics: string[];
}

export interface DigestContentItem {
  contentId: string;
  order: number;
  length: PromptLength;
  topics: string[];
}

export interface DigestListItem {
  _id: string;
  prompt: {
    length?: PromptLength;
    topics: string[];
  };
  defaultTiming: {
    timingId: string;
    schedule: Schedule;
    targetsCount: number;
  } | null;
}

export interface DigestContent {
  length: PromptLength;
  topics: string[];
}

export interface DigestTimingListItem {
  timingId: string;
  schedule: Schedule;
  targetsCount: number;
}

export interface DigestTimingTargetsResponse {
  timingId: string;
  targets: Target[];
}

