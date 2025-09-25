import React, { useState } from 'react';
import styled from 'styled-components';

export interface SegmentedControlOption {
    value: string;
    label: string;
    disabled?: boolean;
    tooltip?: string;
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
    border: 1px solid var(--color-border-primary);
    background-color: var(--color-background-secondary);
    opacity: ${props => props.disabled ? 0.6 : 1};
    pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`;

const SegmentedControlOption = styled.button<{
    isSelected: boolean;
    disabled?: boolean;
    isFirst?: boolean;
    isLast?: boolean;
}>`
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    background-color: ${props =>
        props.isSelected
            ? 'var(--color-brand-500)'
            : 'transparent'
    };
    color: ${props =>
        props.isSelected
            ? 'white'
            : 'var(--color-text-primary)'
    };
    font-weight: ${props => props.isSelected ? '600' : '500'};
    font-size: 0.875rem;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    border-right: ${props =>
        props.isLast ? 'none' : '1px solid var(--color-border-primary)'
    };
    opacity: ${props => props.disabled ? 0.5 : 1};
    position: relative;
    
    &:hover:not(:disabled) {
        background-color: ${props =>
        props.isSelected
            ? 'var(--color-brand-600)'
            : 'var(--color-background-tertiary)'
    };
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

const Tooltip = styled.div<{ show: boolean }>`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-background-inverse);
    color: var(--color-text-inverse);
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    z-index: 1000;
    opacity: ${props => props.show ? 1 : 0};
    visibility: ${props => props.show ? 'visible' : 'hidden'};
    transition: opacity 0.2s ease, visibility 0.2s ease;
    margin-bottom: 0.5rem;
    
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: var(--color-background-inverse);
    }
`;

const SegmentedControl: React.FC<SegmentedControlProps> = ({
    options,
    value,
    onChange,
    disabled = false,
    className
}) => {
    const [hoveredOption, setHoveredOption] = useState<string | null>(null);

    const handleOptionClick = (optionValue: string, optionDisabled?: boolean) => {
        if (optionDisabled || disabled) return;
        onChange?.(optionValue);
    };

    const handleMouseEnter = (optionValue: string) => {
        setHoveredOption(optionValue);
    };

    const handleMouseLeave = () => {
        setHoveredOption(null);
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
                    isLast={index === options.length - 1}
                    onClick={() => handleOptionClick(option.value, option.disabled)}
                    onMouseEnter={() => handleMouseEnter(option.value)}
                    onMouseLeave={handleMouseLeave}
                >
                    {option.label}
                    {option.tooltip && hoveredOption === option.value && (
                        <Tooltip show={true}>
                            {option.tooltip}
                        </Tooltip>
                    )}
                </SegmentedControlOption>
            ))}
        </SegmentedControlContainer>
    );
};

export default SegmentedControl;
