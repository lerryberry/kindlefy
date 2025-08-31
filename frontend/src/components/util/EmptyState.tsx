import React from 'react';
import styled from 'styled-components';

interface EmptyStateProps {
    text?: string;
    createLinkText?: string;
    createLinkHref?: string;
    onCreateClick?: () => void;
}

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const EmptyStateText = styled.p`
  margin-bottom: 1rem;
`;

const CreateLink = styled.a`
  text-decoration: none;
  color: var(--color-brand-500);
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState: React.FC<EmptyStateProps> = ({
    text = "No results found",
    createLinkText = "Create new",
    createLinkHref,
    onCreateClick
}) => {
    const renderCreateAction = () => {
        if (!createLinkHref && !onCreateClick) {
            return null;
        }

        if (createLinkHref) {
            return (
                <CreateLink href={createLinkHref}>
                    + {createLinkText}
                </CreateLink>
            );
        }

        return (
            <CreateLink onClick={onCreateClick}>
                + {createLinkText}
            </CreateLink>
        );
    };

    return (
        <EmptyStateContainer>
            <EmptyStateText>{text}</EmptyStateText>
            {renderCreateAction()}
        </EmptyStateContainer>
    );
};

export default EmptyState;
