import React, { useState } from 'react';
import styled from 'styled-components';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'ghost' | 'filled';
  size?: 'small' | 'medium' | 'large';
  type?: 'success' | 'fail' | 'default';
}

const StyledChip = styled.span<{ variant: string; size: string; type: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  border: 2px solid transparent;
  
  /* Size variants */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          height: 1.25rem;
          min-width: 1.5rem;
          padding: 0 0.375rem;
          font-size: 10px;
        `;
      case 'large':
        return `
          height: 2rem;
          min-width: 2.5rem;
          padding: 0 0.75rem;
          font-size: 14px;
        `;
      case 'medium':
      default:
        return `
          height: 1.5rem;
          min-width: 2rem;
          padding: 0 0.5rem;
          font-size: 12px;
        `;
    }
  }}
  
  /* Type variants */
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: ${props.variant === 'ghost' ? 'transparent' : 'var(--color-success)'};
          color: var(--color-success);
          border-color: var(--color-success);
        `;
      case 'fail':
        return `
          background-color: ${props.variant === 'ghost' ? 'transparent' : 'var(--color-error)'};
          color: var(--color-error);
          border-color: var(--color-error);
        `;
      case 'default':
      default:
        return `
          background-color: ${props.variant === 'ghost' ? 'transparent' : 'var(--color-background-primary)'};
          color: var(--color-text-primary);
          border-color: var(--color-border-primary);
        `;
    }
  }}
`;


const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(({
  children,
  variant = 'filled',
  size = 'medium',
  type = 'default',
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
      return text;
    }
    return children;
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
      size={size}
      type={type}
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
