import React from 'react';
import styled from 'styled-components';

interface LoadingProps {
    text?: string;
}

const LoadingContainer = styled.div`
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
    font-size: 1rem;
`;

const Loading: React.FC<LoadingProps> = ({ text = "Loading..." }) => {
    return (
        <LoadingContainer>
            {text}
        </LoadingContainer>
    );
};

export default Loading;
