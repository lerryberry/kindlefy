import styled from 'styled-components';
import PageLayout from '../layouts/PageLayout';
import { PLAN_LIMIT_BULLETS } from '../../constants/planLimits';
import { getActiveClientPlan } from '../../constants/clientPlan';

const Lead = styled.p`
  margin: 0 0 1.25rem;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text-primary);
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
`;

const OptionRow = styled.p<{ $active?: boolean }>`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--color-text-primary);
  padding: 0.5rem 0.65rem;
  border-radius: 0.375rem;
  border: 1px solid
    ${(p) => (p.$active ? 'var(--color-brand-500)' : 'var(--color-border-primary)')};
  background: ${(p) => (p.$active ? 'var(--color-background-tertiary)' : 'transparent')};
`;

const LimitsIntro = styled.p`
  margin: 0 0 0.4rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-secondary);
`;

const LimitsList = styled.ul`
  margin: 0;
  padding-left: 1.15rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text-primary);
`;

export default function PlansPage() {
  const active = getActiveClientPlan();
  const trialActive = active.id === 'trial';
  const monthlyActive = active.id === 'monthly';

  return (
    <PageLayout title="Plans">
      <Lead>
        You are on the <strong>{active.shortName}</strong> plan. Trial and paid use the same limits.
      </Lead>

      <Options>
        <OptionRow $active={trialActive}>
          <strong>30-day free trial</strong> — {trialActive ? 'current' : '$0'}
        </OptionRow>
        <OptionRow $active={monthlyActive}>
          <strong>Monthly</strong> — {monthlyActive ? 'current' : '$19/mo'}
        </OptionRow>
      </Options>

      <LimitsIntro>Limits</LimitsIntro>
      <LimitsList>
        {PLAN_LIMIT_BULLETS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </LimitsList>
    </PageLayout>
  );
}
