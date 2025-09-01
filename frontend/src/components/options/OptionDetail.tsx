import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import { useGetOption } from './useGetOption';
import Button from '../util/Button';
import Dialog from '../util/Dialog';
import { useDeleteOption } from './useDeleteOption';

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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteOptionMutation, isDeleting } = useDeleteOption();

  if (!optionId || !decisionId) {
    return <div>Option ID and Decision ID are required</div>;
  }

  const { data: option, isLoading, error } = useGetOption(optionId);

  const handleDelete = () => {
    if (optionId) {
      deleteOptionMutation(optionId);
    }
    setShowDeleteDialog(false);
  };

  if (isLoading) return <div>Loading option...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!option?.data) return <div>Option not found</div>;

  return (
    <>
      <PageLayout
        title={
          <TitleWrapper onClick={() => navigate(`/decisions/${decisionId}/options/${optionId}/edit`)}>
            <h1>{option.data.title}</h1>
            <span className="edit-icon">&#x270E;</span>
          </TitleWrapper>
        }
        showBackButton={true}
        onBackClick={() => navigate(-1)}
      >
        <div style={{ marginBottom: '1rem' }}>
          <strong>Description:</strong> {option.data.description || 'No description provided'}
        </div>

        <Button
          text={isDeleting ? "Deleting..." : "Delete Option"}
          onClick={() => setShowDeleteDialog(true)}
          size="small"
          variant="ghost"
          disabled={isDeleting}
        />
      </PageLayout>

      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Option"
        description="Are you sure you want to delete this option? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default OptionDetail;
