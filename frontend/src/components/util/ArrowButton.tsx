import React from 'react';
import styled, { css } from 'styled-components';

type ArrowButtonSize = "small" | "large";
type ArrowButtonDirection = "forward" | "back";

interface ArrowButtonProps {
    size?: ArrowButtonSize;
    direction: ArrowButtonDirection;
    onClick?: () => void;
}

const sizeStyles: Record<ArrowButtonSize, ReturnType<typeof css>> = {
    small: css`
        width: 24px;
        height: 24px;
        font-size: 1rem;
    `,
    large: css`
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
    `,
};

const StyledArrowButton = styled.button<{
    size: ArrowButtonSize;
    direction: ArrowButtonDirection;
}>`
    background: none;
    border: none;
    color: var(--color-brand-500);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%; /* Make it circular */
    transition: background-color 0.2s ease-in-out;

    ${({ size }) => sizeStyles[size]}

    &:hover {
        background-color: var(--color-brand-100);
    }

    &:active {
        background-color: var(--color-brand-200);
    }

    &::before {
        content: ${({ direction }) => (direction === "back" ? "'\u2190'" : "'\u2192'")};
        display: inline-block;
    }
`;

const ArrowButton: React.FC<ArrowButtonProps> = ({ size = "small", direction, onClick }) => {
    // Cast size to ArrowButtonSize as "medium" is not a valid type, will be changed in the next step
    return (
        <StyledArrowButton size={size as ArrowButtonSize} direction={direction} onClick={onClick} aria-label={`${direction} arrow`}>
        </StyledArrowButton>
    );
};

export default ArrowButton;
