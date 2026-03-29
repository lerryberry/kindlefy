export type PromptLength = 'short' | 'medium' | 'long';

export interface Prompt {
  _id: string;
  user: string;
  length: PromptLength;
  topics: string[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptsListResponse {
  status: string;
  results: number;
  totalResults?: number;
  page?: number;
  limit?: number;
  lastPage?: boolean;
  data: Prompt[];
}

export interface PromptResponse {
  status: string;
  data: Prompt;
}

export interface CreatePromptBody {
  length: PromptLength;
  topics?: string[];
}

export interface UpdatePromptBody {
  length?: PromptLength;
  topics?: string[];
}
