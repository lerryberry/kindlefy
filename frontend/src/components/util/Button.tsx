import React from 'react';
import styled, { css } from 'styled-components';

// Button size type
type ButtonSize = "small" | "medium" | "large";

// Button type
type ButtonType = "button" | "submit" | "reset";

// Button variant type
export type ButtonVariant = "default" | "ghost";

// Main button props interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: ButtonType;
  text?: string;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  isResponsive?: boolean;
  /** Full width at all breakpoints (wizard footers, dialogs) */
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

// Size styles configuration
const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  small: css`
    padding: 8px 16px;
    font-size: 0.85rem;
  `,
  medium: css`
    padding: 12px 24px;
    font-size: 1rem;
  `,
  large: css`
    padding: 16px 32px;
    font-size: 1.2rem;
  `,
};

// Styled button component with proper typing
const StyledButton = styled.button<{
  size?: ButtonSize;
  variant?: ButtonVariant;
  isResponsive?: boolean;
  $fullWidth?: boolean;
}>`
  background: ${props => props.variant === 'ghost' ? 'transparent' : 'var(--color-brand-500)'};
  color: ${props => props.variant === 'ghost' ? 'var(--color-brand-500)' : 'var(--color-text-inverse)'};
  border: ${props => props.variant === 'ghost' ? '1px solid var(--color-brand-500)' : 'none'};
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${(p) => (p.$fullWidth ? '100%' : 'auto')};
  min-width: ${(p) => (p.$fullWidth ? '0' : 'fit-content')};
  box-sizing: border-box;

  ${(props) =>
    props.$fullWidth
      ? ''
      : props.isResponsive &&
        `
    width: 100%;
    
    @media (min-width: 768px) {
      width: auto;
      min-width: fit-content;
    }
  `}
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    ${props => props.variant === 'ghost' ? `
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
  
  ${({ size = "medium" }) => sizeStyles[size]}
`;

const Button: React.FC<ButtonProps> = ({
  type = "button",
  text,
  disabled = false,
  size = "medium",
  variant = "default",
  isResponsive = false,
  fullWidth = false,
  onClick,
  children,
  ...rest
}) => (
  <StyledButton
    type={type}
    disabled={disabled}
    size={size}
    variant={variant}
    isResponsive={fullWidth ? false : isResponsive}
    $fullWidth={fullWidth}
    onClick={onClick}
    {...rest}
  >
    {text || children}
  </StyledButton>
);

export default Button;