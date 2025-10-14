import { useParams } from "react-router-dom";
import { useAddCriteria } from './useAddCriteria';
import { useUpdateCriterion } from './useUpdateCriterion';
import { useDeleteCriterion } from './useDeleteCriterion';
import toast from 'react-hot-toast';
import type { CreateCriteriaData } from '../../types/criteria';
import type { CreateCriteriaFormData, CreateCriteriaListFormInputProps } from '../../types/common';
import { useEffect } from 'react';
import InlineFormInput from '../util/InlineFormInput';

function CreateCriteriaListFormInput({ criterionId, criterionTitle, criterionPriority, isNew = false, hidePriority = false }: CreateCriteriaListFormInputProps) {
    const { decisionId } = useParams<{ decisionId: string }>();
    const { addCriteria, isAdding, isSuccess: isAddSuccess, createdCriteria } = useAddCriteria();
    const { updateCriterionMutation, isUpdating, isUpdateSuccess } = useUpdateCriterion();
    const { deleteCriterion: deleteCriterionMutation, isDeleting } = useDeleteCriterion();
    // Original values are now managed by InlineFormInput

    // Original values are now managed by InlineFormInput

    // Handle successful add operation
    useEffect(() => {
        if (isAddSuccess && createdCriteria) {
            toast.success("Criteria added successfully");
            // Reset handled by InlineFormInput
        }
    }, [isAddSuccess, createdCriteria, isNew]);

    // Handle successful update operation
    useEffect(() => {
        if (isUpdateSuccess) {
            toast.success("Criteria updated successfully");
        }
    }, [isUpdateSuccess]);

    const isSubmitWorking = isAdding || isUpdating;
    const isDeleteWorking = isDeleting;

    function onSubmit(data: CreateCriteriaFormData): void {
        if (!decisionId) {
            toast.error("Decision ID is required");
            return;
        }

        if (criterionId && !isNew) {
            // Edit mode
            updateCriterionMutation({
                decisionId: decisionId,
                criterionId: criterionId,
                formData: {
                    title: data.title,
                    priority: data.priority,
                }
            });
        } else {
            // Create mode - single criteria object
            const criteriaData: CreateCriteriaData = {
                title: data.title,
                priority: data.priority!,
                parentDecision: decisionId
            };
            addCriteria(criteriaData);
        }
    }

    function handleDelete(): void {
        if (!criterionId || isNew) {
            toast.error("Cannot delete new criteria");
            return;
        }

        deleteCriterionMutation(criterionId);
    }

    return (
        <InlineFormInput
            itemId={criterionId}
            itemTitle={criterionTitle}
            itemPriority={criterionPriority}
            isNew={isNew}
            hidePriority={hidePriority}
            formData={{ title: criterionTitle || '', priority: criterionPriority || 'UNSORTED' }}
            placeholder="Create a criterion"
            onSubmit={onSubmit}
            onDelete={handleDelete}
            isSubmitWorking={isSubmitWorking}
            isDeleteWorking={isDeleteWorking}
            onAddSuccess={isAddSuccess ? () => { } : undefined}
            onUpdateSuccess={isUpdateSuccess ? () => { } : undefined}
        />
    );
}

export default CreateCriteriaListFormInput;