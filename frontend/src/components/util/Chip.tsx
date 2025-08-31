import React from 'react';
import styled from 'styled-components';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: 'priority' | 'tag';
    priority?: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
}

const StyledChip = styled.span<{ variant: string; priority?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  min-width: 2rem;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
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
    ...props
}, ref) => {
    return (
        <StyledChip
            ref={ref}
            variant={variant}
            priority={priority}
            {...props}
        >
            {children}
        </StyledChip>
    );
});

Chip.displayName = 'Chip';

export default Chip;
