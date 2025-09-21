import React from 'react';
import styled from 'styled-components';

// Button type
type ButtonType = "button" | "submit" | "reset";


// InlineButton props interface
interface InlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    type?: ButtonType;
    disabled?: boolean;
    ghost?: boolean;
    isWorking?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children?: React.ReactNode;
}

// Animated loading character
const LoadingCharacter = styled.span`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Styled button component with proper typing
const StyledInlineButton = styled.button<{ ghost?: boolean }>`
  background: ${props => props.ghost ? 'transparent' : 'var(--color-brand-500)'};
  color: ${props => props.ghost ? 'var(--color-brand-500)' : 'var(--color-text-inverse)'};
  border: ${props => props.ghost ? '1px solid var(--color-brand-500)' : 'none'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: 41px;
  height: 41px;
  min-width: 41px;
  min-height: 41px;
  padding: 0;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    ${props => props.ghost ? `
      background: var(--color-brand-500);
      color: var(--color-text-inverse);
    ` : `
      background: transparent;
      color: var(--color-brand-500);
      border: 1px solid var(--color-brand-500);
    `}
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InlineButton: React.FC<InlineButtonProps> = ({
    type = "button",
    disabled = false,
    ghost = false,
    isWorking = false,
    onClick,
    children,
    ...rest
}) => {
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Prevent input from losing focus
        if (onClick) {
            onClick(e);
        }
    };

    return (
        <StyledInlineButton
            type={type}
            disabled={disabled || isWorking}
            ghost={ghost}
            onMouseDown={handleMouseDown}
            {...rest}
        >
            {isWorking ? (
                <LoadingCharacter>⟲</LoadingCharacter>
            ) : (
                children
            )}
        </StyledInlineButton>
    );
};

export default InlineButton;
