import { useParams } from "react-router-dom";
import { useAddOption } from './useAddOption';
import { useUpdateOption } from './useUpdateOption';
import { useDeleteOption } from './useDeleteOption';
import toast from 'react-hot-toast';
import type { CreateOptionData } from '../../types/options';
import type { CreateOptionFormData, CreateOptionListFormInputProps } from '../../types/common';
import { useEffect } from 'react';
import InlineFormInput from '../util/InlineFormInput';

function CreateOptionListFormInput({ optionId, optionTitle, isNew = false }: CreateOptionListFormInputProps) {
    const { decisionId } = useParams<{ decisionId: string }>();
    const { addOption, isAdding, isSuccess: isAddSuccess, createdOption } = useAddOption();
    const { updateOptionMutation, isUpdating, isSuccess: isUpdateSuccess, updatedOption } = useUpdateOption();
    const { deleteOptionMutation, isDeleting } = useDeleteOption();
    // Original values are now managed by InlineFormInput

    // Original values are now managed by InlineFormInput

    // Handle successful add operation
    useEffect(() => {
        if (isAddSuccess && createdOption) {
            toast.success("Option added successfully");
            // Reset handled by InlineFormInput
        }
    }, [isAddSuccess, createdOption, isNew]);

    // Handle successful update operation
    useEffect(() => {
        if (isUpdateSuccess && updatedOption) {
            toast.success("Option updated successfully");
        }
    }, [isUpdateSuccess, updatedOption]);

    const isSubmitWorking = isAdding || isUpdating;
    const isDeleteWorking = isDeleting;

    function onSubmit(data: CreateOptionFormData): void {
        if (!decisionId) {
            toast.error("Decision ID is required");
            return;
        }

        if (optionId && !isNew) {
            // Edit mode
            updateOptionMutation({
                optionId: optionId,
                decisionId: decisionId,
                title: data.title,
            });
        } else {
            // Create mode - wrap in array
            const optionData: CreateOptionData[] = [{
                title: data.title,
                parentDecision: decisionId
            }];
            addOption(optionData);
        }
    }

    function handleDelete(): void {
        if (!optionId || isNew) {
            toast.error("Cannot delete new option");
            return;
        }

        deleteOptionMutation(optionId);
    }

    return (
        <InlineFormInput
            itemId={optionId}
            itemTitle={optionTitle}
            isNew={isNew}
            hidePriority={true} // Options don't have priority
            formData={{ title: optionTitle || '' }}
            placeholder="Create an option"
            onSubmit={onSubmit}
            onDelete={handleDelete}
            isSubmitWorking={isSubmitWorking}
            isDeleteWorking={isDeleteWorking}
            onAddSuccess={isAddSuccess ? () => { } : undefined}
            onUpdateSuccess={isUpdateSuccess ? () => { } : undefined}
        />
    );
}

export default CreateOptionListFormInput;