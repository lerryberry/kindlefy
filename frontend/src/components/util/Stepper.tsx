import React from 'react';
import styled from 'styled-components';
import StatusIndicator from './StatusIndicator';

interface StepperStep {
  id: string;
  label: string;
  isComplete: boolean;
  onClick?: () => void;
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
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.75rem;
  min-width: 0;
`;

const TrackCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
  align-self: stretch;
`;

const IndicatorWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding-top: 2px;
`;

const TrackLine = styled.div`
  flex: 1;
  width: 2px;
  min-height: 0.5rem;
  margin-top: 4px;
  background-color: var(--color-border-primary);
  border-radius: 1px;
`;

const BodyCol = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding-bottom: 1.25rem;
`;

const StepHeader = styled.div<{ $clickable: boolean }>`
  display: flex;
  align-items: center;
  padding: 2px 0 0.5rem 0;
  cursor: ${(p) => (p.$clickable ? 'pointer' : 'default')};
  user-select: none;
`;

const StepLabel = styled.div`
  color: var(--color-text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
`;

const NestedForm = styled.div`
  padding-left: 0;
  padding-top: 0.25rem;
  min-width: 0;
`;

const Stepper: React.FC<StepperProps> = ({ steps, activeStepId, children, className }) => {
  const handleStepClick = (step: StepperStep) => {
    if (step.onClick) {
      step.onClick();
    }
  };

  return (
    <StepperContainer className={className} role="navigation" aria-label="Setup steps">
      {steps.map((step, index) => {
        const clickable = Boolean(step.onClick);
        const isActive = activeStepId === step.id;
        const showLine = index < steps.length - 1;

        return (
          <StepBlock key={step.id}>
            <TrackCol>
              <IndicatorWrap>
                <StatusIndicator isComplete={step.isComplete} size="large" />
              </IndicatorWrap>
              {showLine ? <TrackLine aria-hidden /> : null}
            </TrackCol>
            <BodyCol>
              <StepHeader
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
              >
                <StepLabel>{step.label}</StepLabel>
              </StepHeader>
              {isActive ? <NestedForm>{children}</NestedForm> : null}
            </BodyCol>
          </StepBlock>
        );
      })}
    </StepperContainer>
  );
};

export default Stepper;
