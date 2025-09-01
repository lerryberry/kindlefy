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
import Chip from '../util/Chip';
import toast from 'react-hot-toast';



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
    const { data: criterion, isLoading, error } = useGetCriterion(criterionId || '');

    if (!criterionId) {
        return <div>Criterion ID is required</div>;
    }

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

    // Capitalize the first letter of the title
    const capitalizedTitle = criterion.data.title && typeof criterion.data.title === 'string' ? criterion.data.title.charAt(0).toUpperCase() + criterion.data.title.slice(1) : criterion.data.title;

    return (
        <>
            <PageLayout
                title={
                    <TitleWrapper onClick={() => navigate(`/decisions/${decisionId}/criteria/${criterionId}/edit`)}>
                        <h1>{capitalizedTitle}</h1>
                        <span className="edit-icon">&#x270E;</span>
                    </TitleWrapper>
                }
                addButtonText="Add Option"
                onAddClick={() => navigate(`/decisions/${decisionId}/criteria/${criterionId}/options/new`)}
                showBackButton={true}
                onBackClick={() => navigate(`/decisions/${decisionId}`)}
            >
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
                                {criterion.data.description}
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <Chip variant="priority" priority={criterion.data.priority}>
                                {criterion.data.priority.replace('_', ' ')}
                            </Chip>
                        </div>

                        <Button
                            text={isDeleting ? "Deleting..." : "Delete Criterion"}
                            onClick={() => setShowDeleteDialog(true)}
                            size="small"
                            variant="ghost"
                            disabled={isDeleting}
                        />
                    </Tab>
                </Tabs>
            </PageLayout>

            <Dialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                title="Delete Criterion"
                description="Are you sure you want to delete this criterion? This action cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                onConfirm={handleDelete}
            />
        </>
    );
};

export default CriterionDetail;
