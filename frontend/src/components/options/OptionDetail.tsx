import React from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import { useGetOption } from './useGetOption';

const StatusBadge = styled.span<{ isArchived: boolean }>`
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: ${props => props.isArchived ? '#fee2e2' : '#dcfce7'};
    color: ${props => props.isArchived ? '#991b1b' : '#166534'};
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  h1 {
    margin: 0;
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .edit-icon {
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  &:hover .edit-icon {
    opacity: 1;
  }
`;

const OptionDetail: React.FC = () => {
  const { optionId, decisionId } = useParams<{ optionId: string; decisionId: string }>();
  const navigate = useNavigate();

  if (!optionId || !decisionId) {
    return <div>Option ID and Decision ID are required</div>;
  }

  const { data: option, isLoading, error } = useGetOption(optionId);

  if (isLoading) return <div>Loading option...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!option?.data) return <div>Option not found</div>;

  return (
    <PageLayout title={
      <TitleWrapper onClick={() => navigate(`/decisions/${decisionId}/options/${optionId}/edit`)}>
        <h1>{option.data.title}</h1>
        <span className="edit-icon">&#x270E;</span>
      </TitleWrapper>
    }>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Description:</strong> {option.data.description || 'No description provided'}
      </div>

      <div>
        <strong>Status:</strong> <StatusBadge isArchived={option.data.isArchived}>
          {option.data.isArchived ? 'Archived' : 'Active'}
        </StatusBadge>
      </div>
    </PageLayout>
  );
};

export default OptionDetail;
