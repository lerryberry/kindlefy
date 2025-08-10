import * as React from 'react';
import styled, { css } from 'styled-components';
import type { ButtonProps } from '../../types';

const sizeStyles = {
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

const StyledButton = styled.button<{ size?: "small" | "medium" | "large" }>`
  background: var(--color-brand-50);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  ${({ size = "medium" }) => sizeStyles[size]}
`;

const Button: React.FC<ButtonProps> = ({ type, text, disabled, size = "medium" }) => (
  <StyledButton type={type} disabled={disabled} size={size}>
    {text}
  </StyledButton>
);

export default Button;