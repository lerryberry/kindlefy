import { useForm } from 'react-hook-form';
import { useParams } from "react-router-dom";
import InlineButton from '../util/InlineButton';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import { useAddOption } from './useAddOption';
import { useUpdateOption } from './useUpdateOption';
import { useDeleteOption } from './useDeleteOption';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";
import type { CreateOptionData } from '../../types/options';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

interface CreateOptionFormData {
    title: string;
}

const InlineFormContainer = styled.div`
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
    flex-direction: column;
    
    @media (min-width: 768px) {
        flex-direction: row;
    }
`;

const InputContainer = styled.div`
    flex: 1;
    position: relative;
`;

const ButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: flex-end;
`;

const StyledForm = styled(Form)`
    padding: 0.5rem 0;
`;

interface CreateOptionListFormInputProps {
    optionId?: string;
    optionTitle?: string;
    isNew?: boolean;
}

function CreateOptionListFormInput({ optionId, optionTitle, isNew = false }: CreateOptionListFormInputProps) {
    const { decisionId } = useParams<{ decisionId: string }>();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateOptionFormData>();
    const { addOption, isAdding, isSuccess: isAddSuccess, createdOption } = useAddOption();
    const { updateOptionMutation, isUpdating, isSuccess: isUpdateSuccess, updatedOption } = useUpdateOption();
    const { deleteOptionMutation, isDeleting } = useDeleteOption();
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (optionId && optionTitle) {
            reset({
                title: optionTitle,
            });
        }
    }, [optionId, optionTitle, reset]);

    // Handle successful add operation
    useEffect(() => {
        if (isAddSuccess && createdOption) {
            // Option added successfully - query invalidation will update the UI
            toast.success("Option added successfully");

            // If this is a new option form, clear the input field
            if (isNew) {
                reset({ title: "" });
            }
        }
    }, [isAddSuccess, createdOption, isNew, reset]);

    // Handle successful update operation
    useEffect(() => {
        if (isUpdateSuccess && updatedOption) {
            // Option updated successfully - query invalidation will update the UI
            toast.success("Option updated successfully");
        }
    }, [isUpdateSuccess, updatedOption]);

    const isWorking = isAdding || isUpdating || isDeleting;

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

    function onError(errors: FieldErrors<CreateOptionFormData>): void {
        const errorMessage = Object.values(errors)[0]?.message || "Form validation failed";
        toast.error(errorMessage);
    }

    function handleDelete(): void {
        if (!optionId || isNew) {
            toast.error("Cannot delete new option");
            return;
        }

        deleteOptionMutation(optionId);
    }

    return (
        <StyledForm
            onSubmit={handleSubmit(onSubmit, onError)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <InlineFormContainer>
                <InputContainer
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                >
                    <FormInput
                        type="text"
                        required
                        {...register("title", {
                            required: "Title is required",
                            minLength: {
                                value: 3,
                                message: "Minimum of 3 characters required"
                            },
                            maxLength: {
                                value: 200,
                                message: "Maximum of 200 characters allowed"
                            }
                        })}
                    />
                    {errors.title && (
                        <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                            {errors.title.message}
                        </p>
                    )}
                </InputContainer>
                <ButtonContainer>
                    {isHovered && optionId && !isNew && (
                        <InlineButton
                            type="button"
                            onClick={handleDelete}
                            isWorking={isWorking}
                        >
                            ✗
                        </InlineButton>
                    )}
                    {isFocused && (
                        <InlineButton
                            type="submit"
                            isWorking={isWorking}
                        >
                            ✓
                        </InlineButton>
                    )}
                </ButtonContainer>
            </InlineFormContainer>
        </StyledForm>
    );
}

export default CreateOptionListFormInput;
