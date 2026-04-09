export interface Prompt {
  _id: string;
  user: string;
  /** Target word count (500–5000). */
  length: number;
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
  length: number;
  topics?: string[];
}

export interface UpdatePromptBody {
  length?: number;
  topics?: string[];
}
