import React from 'react';
import styled from 'styled-components';

interface RightArrowProps {
    onClick?: () => void;
}

const ArrowContainer = styled.span`
    color: #6b7280;
    font-size: 1.2rem;
    margin-left: 1rem;
    cursor: ${props => props.onClick ? 'pointer' : 'default'};
`;

const RightArrow: React.FC<RightArrowProps> = ({ onClick }) => {
    return (
        <ArrowContainer onClick={onClick}>
            ›
        </ArrowContainer>
    );
};

export default RightArrow;
