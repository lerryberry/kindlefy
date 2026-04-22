import type { NewsScope } from '../constants/newsScope';
import type { Schedule } from './timing';
import type { Target } from './target';

export interface DigestPrompt {
  length: number;
  topics: string[];
  newsScope: NewsScope;
  locationText: string;
}

export interface LocationCoordinates {
  lat: number | null;
  lng: number | null;
}

export interface DigestContentItem {
  contentId: string;
  order: number;
  length: number;
  topics: string[];
  newsScope: NewsScope;
  locationText: string;
  locationCoordinates: LocationCoordinates;
  locationTimezone: string;
}

export interface DigestListItem {
  _id: string;
  enabled: boolean;
  prompt: {
    length?: number;
    topics: string[];
    newsScope?: NewsScope;
    locationText?: string;
  };
  defaultTiming: {
    timingId: string;
    schedule: Schedule;
    targetsCount: number;
  } | null;
}

export interface DigestContent {
  length: number;
  topics: string[];
  newsScope: NewsScope;
  locationText: string;
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
