import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import { useGetCriterion } from './useGetCriterion';
import { useDeleteCriterion } from './useDeleteCriterion';
import Tabs, { Tab } from '../util/Tabs';
import OptionsList from '../options/OptionsList';
// import GroupedOptionsRankingForm from '../options/GroupedOptionsRankingForm';
import Button from '../util/Button';
import Dialog from '../util/Dialog';
import toast from 'react-hot-toast';

const PriorityBadge = styled.span<{ priority: string }>`
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: ${props => {
        switch (props.priority) {
            case 'MUST_HAVE': return '#dcfce7';
            case 'SHOULD_HAVE': return '#fef3c7';
            case 'COULD_HAVE': return '#dbeafe';
            case 'WONT_HAVE': return '#fee2e2';
            default: return '#f3f4f6';
        }
    }};
    color: ${props => {
        switch (props.priority) {
            case 'MUST_HAVE': return '#166534';
            case 'SHOULD_HAVE': return '#92400e';
            case 'COULD_HAVE': return '#1e40af';
            case 'WONT_HAVE': return '#991b1b';
            default: return '#374151';
        }
    }};
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; // Spacing between title and edit button
  cursor: pointer;

  h1 {
    margin: 0;
    font-size: 1.875rem; // Equivalent to text-3xl
    line-height: 2.25rem; // Equivalent to leading-9
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

const CriterionDetail: React.FC = () => {
    const { criterionId, decisionId } = useParams<{ criterionId: string; decisionId: string }>();
    const navigate = useNavigate();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const { deleteCriterion, isDeleting } = useDeleteCriterion();

    if (!criterionId) {
        return <div>Criterion ID is required</div>;
    }

    const { data: criterion, isLoading, error } = useGetCriterion(criterionId);

    const handleDelete = () => {
        deleteCriterion(criterionId, {
            onSuccess: () => {
                toast.success("Criterion deleted successfully!");
                navigate(`/decisions/${decisionId}`);
            },
            onError: () => {
                toast.error("Failed to delete criterion");
            }
        });
        setShowDeleteDialog(false);
    };

    if (isLoading) return <div>Loading criterion...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!criterion?.data) return <div>Criterion not found</div>;

    return (
        <>
            <PageLayout title={
                <TitleWrapper onClick={() => navigate(`/decisions/${decisionId}/criteria/${criterionId}/edit`)}>
                    <h1>{criterion.data.title}</h1>
                    <span className="edit-icon">&#x270E;</span>
                </TitleWrapper>
            }>
                <Tabs>
                    <Tab name="Options">
                        <OptionsList />
                    </Tab>
                    {/* <Tab name="Rankings">
                        <GroupedOptionsRankingForm />
                    </Tab> */}
                    <Tab name="Details">
                        {criterion.data.description && (
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Description:</strong> {criterion.data.description}
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Priority:</strong> <PriorityBadge priority={criterion.data.priority}>
                                {criterion.data.priority.replace('_', ' ')}
                            </PriorityBadge>
                        </div>

                        <Button
                            text={isDeleting ? "Deleting..." : "Delete Criterion"}
                            onClick={() => setShowDeleteDialog(true)}
                            size="small"
                            disabled={isDeleting}
                        />
                    </Tab>
                </Tabs>
            </PageLayout>

            <Dialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                title="Delete Criterion"
            >
                <p>Are you sure you want to delete this criterion? This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Button
                        text="Cancel"
                        onClick={() => setShowDeleteDialog(false)}
                        size="small"
                    />
                    <Button
                        text={isDeleting ? "Deleting..." : "Delete"}
                        onClick={handleDelete}
                        size="small"
                        disabled={isDeleting}
                    />
                </div>
            </Dialog>
        </>
    );
};

export default CriterionDetail;
