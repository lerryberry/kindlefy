import React from 'react';
import styled, { css } from 'styled-components';

// Button size type
type ButtonSize = "small" | "medium" | "large";

// Button type
type ButtonType = "button" | "submit" | "reset";

// Main button props interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: ButtonType;
  text?: string;
  disabled?: boolean;
  size?: ButtonSize;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

// Size styles configuration
const sizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  small: css`
    padding: 4px 10px;
    font-size: 0.85rem;
  `,
  medium: css`
    padding: 8px 18px;
    font-size: 1rem;
  `,
  large: css`
    padding: 14px 28px;
    font-size: 1.2rem;
  `,
};

// Styled button component with proper typing
const StyledButton = styled.button<{ size?: ButtonSize }>`
  background: var(--color-brand-50);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover:not(:disabled) {
    background: var(--color-brand-60);
    transform: translateY(-1px);
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
  onClick,
  children,
  ...rest
}) => (
  <StyledButton
    type={type}
    disabled={disabled}
    size={size}
    onClick={onClick}
    {...rest}
  >
    {text || children}
  </StyledButton>
);

export default Button;