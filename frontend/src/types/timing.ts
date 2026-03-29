import type { Prompt } from './prompt';
import type { Target } from './target';

export interface Schedule {
  timezone: string;
  timeOfDay: string;
  frequency?: string;
}

export interface Timing {
  _id: string;
  user: string;
  prompt: Prompt | string;
  schedule: Schedule;
  targets: (Target | string)[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimingsListResponse {
  status: string;
  results: number;
  data: Timing[];
}

export interface TimingResponse {
  status: string;
  data: Timing;
}

export interface CreateTimingBody {
  prompt: string;
  schedule: Schedule;
  targets?: string[];
}

export interface UpdateTimingBody {
  prompt?: string;
  schedule?: Schedule;
  targets?: string[];
}
