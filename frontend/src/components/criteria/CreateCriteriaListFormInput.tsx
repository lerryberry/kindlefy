import { useForm } from 'react-hook-form';
import { useParams } from "react-router-dom";
import InlineButton from '../util/InlineButton';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import { useAddCriteria } from './useAddCriteria';
import { useUpdateCriterion } from './useUpdateCriterion';
import { useDeleteCriterion } from './useDeleteCriterion';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";
import type { CreateCriteriaData } from '../../types/criteria';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

interface CreateCriteriaFormData {
    title: string;
    priority?: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
}

const InlineFormContainer = styled.div`
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
`;

const InputContainer = styled.div`
    flex: 1;
    position: relative;
    
    p {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin: 0;
        z-index: 1;
    }
`;

const PriorityContainer = styled.div`
    min-width: 120px;
    position: relative;
    
    p {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin: 0;
        z-index: 1;
    }
`;

const StyledForm = styled(Form)`
    padding: 0.5rem 0;
`;

interface CreateCriteriaListFormInputProps {
    criterionId?: string;
    criterionTitle?: string;
    criterionPriority?: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
    isNew?: boolean;
}

function CreateCriteriaListFormInput({ criterionId, criterionTitle, criterionPriority, isNew = false }: CreateCriteriaListFormInputProps) {
    const { decisionId } = useParams<{ decisionId: string }>();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateCriteriaFormData>({
        defaultValues: {
            title: "",
            priority: "MUST_HAVE"
        }
    });
    const { addCriteria, isAdding, isSuccess: isAddSuccess, createdCriteria } = useAddCriteria();
    const { updateCriterionMutation, isUpdating, isUpdateSuccess } = useUpdateCriterion();
    const { deleteCriterion: deleteCriterionMutation, isDeleting } = useDeleteCriterion();
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (criterionId && criterionTitle && criterionPriority) {
            reset({
                title: criterionTitle,
                priority: criterionPriority,
            });
        }
    }, [criterionId, criterionTitle, criterionPriority, reset]);

    // Handle successful add operation
    useEffect(() => {
        if (isAddSuccess && createdCriteria) {
            // Criteria added successfully - query invalidation will update the UI
            toast.success("Criteria added successfully");

            // If this is a new criteria form, clear the input field
            if (isNew) {
                reset({ title: "", priority: "MUST_HAVE" });
            }
        }
    }, [isAddSuccess, createdCriteria, isNew, reset]);

    // Handle successful update operation
    useEffect(() => {
        if (isUpdateSuccess) {
            // Criteria updated successfully - query invalidation will update the UI
            toast.success("Criteria updated successfully");
        }
    }, [isUpdateSuccess]);

    const isWorking = isAdding || isUpdating || isDeleting;

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

    function onError(errors: FieldErrors<CreateCriteriaFormData>): void {
        const errorMessage = Object.values(errors)[0]?.message || "Form validation failed";
        toast.error(errorMessage);
    }

    function handleDelete(): void {
        if (!criterionId || isNew) {
            toast.error("Cannot delete new criteria");
            return;
        }

        deleteCriterionMutation(criterionId);
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
                        <p style={{ color: "red", fontSize: "0.875rem" }}>
                            {errors.title.message}
                        </p>
                    )}
                </InputContainer>

                <PriorityContainer
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                >
                    <select
                        {...register("priority", {
                            required: "Priority is required"
                        })}
                        style={{
                            width: "100%",
                            height: "100%",
                            padding: "0.5rem",
                            border: "1px solid var(--color-border-secondary)",
                            borderRadius: "4px",
                            backgroundColor: "var(--color-background-tertiary)",
                            color: "var(--color-text-primary)"
                        }}
                    >
                        <option value=""></option>
                        <option value="MUST_HAVE">Must Have</option>
                        <option value="SHOULD_HAVE">Should Have</option>
                        <option value="COULD_HAVE">Could Have</option>
                        <option value="WONT_HAVE">Won't Have</option>
                    </select>
                    {errors.priority && (
                        <p style={{ color: "red", fontSize: "0.875rem" }}>
                            {errors.priority.message}
                        </p>
                    )}
                </PriorityContainer>

                {isHovered && criterionId && !isNew && (
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
            </InlineFormContainer>
        </StyledForm>
    );
}

export default CreateCriteriaListFormInput;
