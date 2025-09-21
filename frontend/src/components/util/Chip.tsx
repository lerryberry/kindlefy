import React, { useState } from 'react';
import styled from 'styled-components';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: 'priority' | 'tag';
    priority?: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
    success?: boolean;
    ghost?: boolean;
}

const StyledChip = styled.span<{ variant: string; priority?: string; success?: boolean; ghost?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  min-width: 2rem;
  padding: 0 0.5rem;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-transform: ${props => props.variant === 'priority' ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.variant === 'priority' ? '0.05em' : 'normal'};
  white-space: nowrap;
  
  /* Default tag styling */
  background-color: var(--color-background-tertiary);
  color: var(--color-text-secondary);
  
  /* Priority-specific styling */
  ${props => props.variant === 'priority' && props.priority && `
    background-color: ${getPriorityBackgroundColor(props.priority)};
    color: ${getPriorityTextColor(props.priority)};
  `}
  
  /* Success-specific styling */
  ${props => props.success && `
    background-color: var(--color-success);
    color: var(--color-text-inverse);
  `}
  
  /* Ghost-specific styling */
  ${props => props.ghost && `
    background-color: transparent;
    color: var(--color-success);
    border: 2px solid var(--color-success);
  `}
`;

const getPriorityBackgroundColor = (priority: string): string => {
    switch (priority) {
        case 'MUST_HAVE': return 'var(--color-success)';
        case 'SHOULD_HAVE': return 'var(--color-warning)';
        case 'COULD_HAVE': return 'var(--color-info)';
        case 'WONT_HAVE': return 'var(--color-error)';
        default: return 'var(--color-gray-100)';
    }
};

const getPriorityTextColor = (priority: string): string => {
    switch (priority) {
        case 'MUST_HAVE': return 'var(--color-text-inverse)';
        case 'SHOULD_HAVE': return 'var(--color-text-inverse)';
        case 'COULD_HAVE': return 'var(--color-text-inverse)';
        case 'WONT_HAVE': return 'var(--color-text-inverse)';
        default: return 'var(--color-text-primary)';
    }
};

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(({
    children,
    variant = 'tag',
    priority,
    success = false,
    ghost = false,
    ...props
}, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    // Truncate text to 30 characters with ellipsis
    const truncateText = (text: string): string => {
        if (text.length <= 30) {
            return text;
        }
        return text.substring(0, 30) + '...';
    };

    // Handle children - if it's a string, show full text on hover or truncated otherwise
    const renderChildren = () => {
        if (typeof children === 'string') {
            // Show full text on hover, truncated text otherwise
            const text = isHovered ? children : truncateText(children);
            // Add tick at the beginning if success is true
            return success ? `✓ ${text}` : text;
        }
        return success ? `✓ ${children}` : children;
    };

    const handleMouseEnter = () => {
        if (typeof children === 'string' && children.length > 30) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <StyledChip
            ref={ref}
            variant={variant}
            priority={priority}
            success={success}
            ghost={ghost}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {renderChildren()}
        </StyledChip>
    );
});

Chip.displayName = 'Chip';

export default Chip;
