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
    color: #3b82f6; /* Example color, adjust as needed */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%; /* Make it circular */
    transition: background-color 0.2s ease-in-out;

    ${({ size }) => sizeStyles[size]}

    &:hover {
        background-color: rgba(59, 130, 246, 0.1); /* Light blue background on hover */
    }

    &:active {
        background-color: rgba(59, 130, 246, 0.2); /* Slightly darker on click */
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
