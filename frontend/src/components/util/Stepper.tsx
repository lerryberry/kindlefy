import React from 'react';
import styled from 'styled-components';
import StatusIndicator from './StatusIndicator';

interface StepperStep {
  id: string;
  label: string;
  isComplete: boolean;
  onClick?: () => void;
  /** Hide the visible label when this step is active (content provides the heading). */
  hideLabelWhenActive?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  /** Which step is active; its nested panel shows `children`. */
  activeStepId: string;
  /** Form / route outlet rendered inside the active step. */
  children: React.ReactNode;
  className?: string;
}

const StepperContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StepBlock = styled.div`
  min-width: 0;
  padding-bottom: 1.25rem;
`;

const StepHeaderRow = styled.div<{ $clickable: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
  min-height: 1.75rem;
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};
  user-select: none;
`;

const StepLabel = styled.div`
  flex: 1;
  min-width: 0;
  color: var(--color-text-primary);
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin-top: -0.12em;
`;

const CompleteSlot = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const StepHeadingDivider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-border-primary);
  margin: 0.4rem 0 0.3rem;
  width: 100%;
`;

const StepHeadingEllipsis = styled.p`
  margin: 0 0 0.45rem;
  padding: 0;
  font-size: 1.2rem;
  line-height: 1.2;
  letter-spacing: 0.12em;
  color: var(--color-text-tertiary);
  user-select: none;
  pointer-events: none;
`;

function StepHeadingPlaceholder() {
  return (
    <StepHeadingEllipsis aria-hidden="true">...</StepHeadingEllipsis>
  );
}

const NestedForm = styled.div`
  min-width: 0;
  padding-top: 0.25rem;
`;

const Stepper: React.FC<StepperProps> = ({ steps, activeStepId, children, className }) => {
  const handleStepClick = (step: StepperStep) => {
    if (step.onClick) {
      step.onClick();
    }
  };

  return (
    <StepperContainer className={className} role="navigation" aria-label="Setup steps">
      {steps.map((step) => {
        const clickable = Boolean(step.onClick);
        const isActive = activeStepId === step.id;
        const hideHeaderLabel = Boolean(isActive && step.hideLabelWhenActive);

        return (
          <StepBlock key={step.id}>
            <StepHeaderRow
              $clickable={clickable}
              onClick={() => handleStepClick(step)}
              onKeyDown={(e) => {
                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleStepClick(step);
                }
              }}
              tabIndex={clickable ? 0 : undefined}
              role={clickable ? 'button' : undefined}
              aria-current={isActive ? 'step' : undefined}
              aria-label={hideHeaderLabel ? step.label : undefined}
            >
              {hideHeaderLabel ? (
                <ScreenReaderOnly aria-current={isActive ? 'step' : undefined}>{step.label}</ScreenReaderOnly>
              ) : (
                <StepLabel as="span">{step.label}</StepLabel>
              )}
              {step.isComplete ? (
                <CompleteSlot aria-hidden="true">
                  <StatusIndicator isComplete size="large" />
                </CompleteSlot>
              ) : null}
            </StepHeaderRow>
            <StepHeadingDivider aria-hidden="true" />
            {!isActive ? <StepHeadingPlaceholder /> : null}
            {isActive ? <NestedForm>{children}</NestedForm> : null}
          </StepBlock>
        );
      })}
    </StepperContainer>
  );
};

export default Stepper;
