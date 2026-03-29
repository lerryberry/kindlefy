/** Preset digest topic tags (stored as prompt `topics` strings). */
export const PROMPT_TOPIC_OPTIONS = [
  'Global News',
  'Science',
  'Technology',
  'Business & Finance',
  'Sports',
  'Culture & Arts',
  'Health & Medicine',
  'Environment',
  'Politics',
  'Opinion & Analysis',
] as const;

export type PromptTopicOption = (typeof PROMPT_TOPIC_OPTIONS)[number];
