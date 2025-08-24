import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useGetOption } from './useGetOption';

const OptionContainer = styled.div`
  width: 100%;
`;

const OptionTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const Option: React.FC = () => {
    const { optionId } = useParams<{ optionId: string }>();

    if (!optionId) {
        return <div>Option ID is required</div>;
    }

    const { data: option, isLoading, error } = useGetOption(optionId);

    if (isLoading) return <div>Loading option...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!option?.data) return <div>Option not found</div>;

    return (
        <OptionContainer>
            <OptionTitle>{option.data.title}</OptionTitle>
        </OptionContainer>
    );
};

export default Option;
