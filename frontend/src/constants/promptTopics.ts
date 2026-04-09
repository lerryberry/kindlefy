/**
 * Preset digest topic chips — exact labels persisted on Prompt `topics`.
 * Keep in sync with backend `constants/promptTopics.js`.
 */
export const PROMPT_TOPIC_OPTIONS = [
  'Science',
  'Astronomy',
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
