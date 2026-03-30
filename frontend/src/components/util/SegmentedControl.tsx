import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'react-tooltip';

export interface SegmentedControlOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SegmentedControlProps {
    options: SegmentedControlOption[];
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

const SegmentedControlContainer = styled.div<{ disabled?: boolean }>`
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid var(--color-border-primary);
    background-color: var(--color-background-tertiary);
    opacity: ${props => props.disabled ? 0.6 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`;

const SegmentedControlOption = styled.button<{
    isSelected: boolean;
    disabled?: boolean;
    isFirst?: boolean;
    leftPurple?: boolean;
}>`
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    background-color: ${props => (props.isSelected ? 'var(--color-background-secondary)' : 'var(--color-background-tertiary)')};
    color: ${props => (props.isSelected ? 'var(--color-brand-500)' : 'var(--color-text-primary)')};
    font-weight: ${props => props.isSelected ? '600' : '500'};
    font-size: 0.875rem;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    opacity: ${props => props.disabled ? 0.5 : 1};
    position: relative;
    border-left: ${props => (props.isFirst ? 'none' : `2px solid ${props.leftPurple ? 'var(--color-brand-500)' : 'var(--color-border-primary)'}`)};
    
    &:hover:not(:disabled) {
        background-color: var(--color-background-secondary);
    }
    
    &:focus {
        outline: 2px solid var(--color-brand-500);
        outline-offset: -2px;
    }
    
    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;


const SegmentedControl: React.FC<SegmentedControlProps> = ({
    options,
    value,
    onChange,
    disabled = false,
    className
}) => {
    const handleOptionClick = (optionValue: string, optionDisabled?: boolean) => {
        if (optionDisabled || disabled) return;
        onChange?.(optionValue);
    };

    return (
        <SegmentedControlContainer
            disabled={disabled}
            className={className}
        >
            {options.map((option, index) => (
                <SegmentedControlOption
                    key={option.value}
                    type="button"
                    isSelected={value === option.value}
                    disabled={option.disabled || disabled}
                    isFirst={index === 0}
                    leftPurple={
                      index > 0 ? value === option.value || value === options[index - 1]?.value : false
                    }
                    onClick={() => handleOptionClick(option.value, option.disabled)}
                    data-tooltip-id={option.disabled ? `tooltip-${option.value}` : undefined}
                    data-tooltip-content={option.disabled ? "Coming soon" : undefined}
                >
                    {option.label}
                </SegmentedControlOption>
            ))}
            {options.filter(option => option.disabled).map(option => (
                <Tooltip key={`tooltip-${option.value}`} id={`tooltip-${option.value}`} />
            ))}
        </SegmentedControlContainer>
    );
};

export default SegmentedControl;
