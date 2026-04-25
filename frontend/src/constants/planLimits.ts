/** Keep in sync with `repo/backend/utils/planLimits.js`. */
export const MAX_DIGESTS_PER_LOGIN = 10;
export const MAX_CONTENT_SECTIONS_PER_DIGEST = 5;
export const MAX_KINDLE_DEVICES_PER_DIGEST = 3;

/** Human-readable limits shown on marketing / plans UI. */
export const PLAN_LIMIT_BULLETS: string[] = [
  `Up to ${MAX_DIGESTS_PER_LOGIN} digests per account`,
  `Up to ${MAX_CONTENT_SECTIONS_PER_DIGEST} content sections per digest`,
  `Up to ${MAX_KINDLE_DEVICES_PER_DIGEST} Kindle devices per digest (across all schedules)`,
];
