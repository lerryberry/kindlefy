/**
 * Client-only plan selection until billing exists.
 * Change `CLIENT_CURRENT_PLAN_ID` to preview the monthly chip and plans page.
 */
export type ClientPlanId = 'trial' | 'monthly';

export const CLIENT_CURRENT_PLAN_ID: ClientPlanId = 'trial';

const PLANS: Record<
  ClientPlanId,
  { chipLabel: string; shortName: string; priceLine: string }
> = {
  trial: {
    chipLabel: '30-day trial',
    shortName: '30-day free trial',
    priceLine: '$0',
  },
  monthly: {
    chipLabel: '$19/mo',
    shortName: '$19 per month',
    priceLine: '$19/mo',
  },
};

export function getActiveClientPlan() {
  return { id: CLIENT_CURRENT_PLAN_ID, ...PLANS[CLIENT_CURRENT_PLAN_ID] };
}
