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
    className?: string;
}

const StepperContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 0.5rem 0 0.5rem;
    position: relative;
    min-height: 80px;
    overflow-x: auto;
    
    @media (max-width: 480px) {
        padding: 0 0.25rem 0 0.25rem;
        min-height: 70px;
    }
`;

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: ${props => props.onClick ? 'pointer' : 'default'};
    min-width: 80px;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    
    @media (max-width: 480px) {
        min-width: 50px;
    }
`;

const ConnectingLine = styled.div`
    flex: 1;

    height: 1px;
    background-color: var(--color-text-secondary);
    margin: 0 0.5rem;
    align-self: center;
    margin-bottom: -29px;
    min-width: 20px;
    
    @media (max-width: 480px) {
        margin: 0 0.125rem;
        margin-bottom: -19px;
    }
`;

const StepLabel = styled.div`
    color: var(--color-text-primary);
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    margin-bottom: 0.75rem;
    cursor: ${props => props.onClick ? 'pointer' : 'default'};
    max-width: 120px;
    line-height: 1.2;
    
    @media (max-width: 480px) {
        font-size: 0.5rem;
        margin-bottom: 0.375rem;
        max-width: 100px;
    }
`;


const Stepper: React.FC<StepperProps> = ({ steps, className }) => {
    const handleStepClick = (step: StepperStep) => {
        if (step.onClick) {
            step.onClick();
        }
    };

    return (
        <StepperContainer className={className}>
            {steps.map((step, index) => (
                <>
                    <StepContainer key={step.id} onClick={() => handleStepClick(step)}>
                        <StepLabel onClick={() => handleStepClick(step)}>
                            {step.label}
                        </StepLabel>
                        <StatusIndicator isComplete={step.isComplete} size="medium" />
                    </StepContainer>
                    {index < steps.length - 1 && <ConnectingLine key={`line-${step.id}`} />}
                </>
            ))}
        </StepperContainer>
    );
};

export default Stepper;
