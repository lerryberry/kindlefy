import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'react-tooltip';

export interface RadioOption {
    value: string;
    label: string;
    description: string;
    disabled?: boolean;
}

export interface RadioGroupProps {
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    name: string;
    disabled?: boolean;
    className?: string;
}

const RadioGroupContainer = styled.div<{ disabled?: boolean }>`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    opacity: ${props => props.disabled ? 0.6 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const RadioOption = styled.label<{ isSelected: boolean; disabled?: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    border: 2px solid ${props =>
        props.isSelected
            ? 'var(--color-brand-500)'
            : 'var(--color-border-primary)'
    };
    border-radius: 8px;
    background-color: ${props =>
        props.isSelected
            ? 'var(--color-brand-50)'
            : 'var(--color-background-primary)'
    };
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    opacity: ${props => props.disabled ? 0.5 : 1};
    
    &:hover:not(:disabled) {
        border-color: ${props =>
        props.isSelected
            ? 'var(--color-brand-600)'
            : 'var(--color-brand-400)'
    };
        background-color: ${props =>
        props.isSelected
            ? 'var(--color-brand-100)'
            : 'var(--color-background-secondary)'
    };
    }
    
    &:focus-within {
        outline: 2px solid var(--color-brand-500);
        outline-offset: 2px;
    }
    
    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const RadioInput = styled.input`
    margin: 0;
    width: 1.25rem;
    height: 1.25rem;
    accent-color: var(--color-brand-500);
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 0.125rem;
    border: 2px solid white;
    border-radius: 50%;
    background-color: transparent;
    
    &:checked:not(:disabled) {
        appearance: none;
        background-color: var(--color-brand-500);
        position: relative;
        
        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0.5rem;
            height: 0.5rem;
            background-color: white;
            border-radius: 50%;
        }
    }
    
    &:checked:disabled {
        appearance: none;
        background-color: transparent;
    }
    
    &:hover:not(:disabled) {
        border-color: var(--color-brand-400);
    }
    
    &:focus {
        outline: 2px solid var(--color-brand-500);
        outline-offset: 2px;
    }
`;

const RadioContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
`;

const RadioLabel = styled.div`
    font-weight: 600;
    font-size: 1rem;
    color: var(--color-text-primary);
    line-height: 1.4;
`;

const RadioDescription = styled.div`
    font-weight: 400;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.4;
`;

const RadioGroup: React.FC<RadioGroupProps> = ({
    options,
    value,
    onChange,
    name,
    disabled = false,
    className
}) => {
    const handleChange = (optionValue: string, optionDisabled?: boolean) => {
        if (optionDisabled || disabled) return;
        onChange?.(optionValue);
    };

    return (
        <RadioGroupContainer
            disabled={disabled}
            className={className}
        >
            {options.map((option) => (
                <RadioOption
                    key={option.value}
                    isSelected={value === option.value}
                    disabled={option.disabled || disabled}
                    data-tooltip-id={option.disabled ? `tooltip-${option.value}` : undefined}
                    data-tooltip-content={option.disabled ? "Coming soon" : undefined}
                >
                    <RadioInput
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => handleChange(option.value, option.disabled)}
                        disabled={option.disabled || disabled}
                    />
                    <RadioContent>
                        <RadioLabel>{option.label}</RadioLabel>
                        <RadioDescription>{option.description}</RadioDescription>
                    </RadioContent>
                </RadioOption>
            ))}
            {options.filter(option => option.disabled).map(option => (
                <Tooltip key={`tooltip-${option.value}`} id={`tooltip-${option.value}`} />
            ))}
        </RadioGroupContainer>
    );
};

export default RadioGroup;
