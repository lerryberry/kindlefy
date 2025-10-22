import { useForm } from 'react-hook-form';
import InlineButton from './InlineButton';
import Form from './Form';
import FormInput from './FormInput';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const InlineFormContainer = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    flex-direction: column;
    
    @media (min-width: 768px) {
        flex-direction: row;
    }
`;

const InputsContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    flex: 1;
`;

const InputContainer = styled.div`
    flex: 1;
    
    p {
        margin: 0;
    }
`;

const PriorityContainer = styled.div`
    min-width: 120px;
    
    p {
        margin: 0;
    }
`;

const ButtonContainer = styled.div<{ hasButtons: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: flex-end;
    padding-right: ${props => props.hasButtons ? '0.5rem' : '0'};
    padding-left: ${props => props.hasButtons ? '0.5rem' : '0'};
`;

const StyledForm = styled(Form)`
    padding: 0.5rem 0;
`;

export interface InlineFormInputProps {
    // Item identification
    itemId?: string;
    itemTitle?: string;
    itemPriority?: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
    isNew?: boolean;
    hidePriority?: boolean;

    // Form data types
    formData: {
        title: string;
        priority?: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
    };

    // Placeholder text
    placeholder?: string;

    // Mutation functions
    onSubmit: (data: any) => void;
    onDelete?: () => void;

    // Loading states
    isSubmitWorking: boolean;
    isDeleteWorking: boolean;

    // Success callbacks
    onAddSuccess?: (data: any) => void;
    onUpdateSuccess?: (data: any) => void;
}

export function InlineFormInput({
    itemId,
    itemTitle,
    itemPriority,
    isNew = false,
    hidePriority = false,
    formData,
    placeholder,
    onSubmit,
    onDelete,
    isSubmitWorking,
    isDeleteWorking,
    onAddSuccess,
    onUpdateSuccess
}: InlineFormInputProps) {
    const { register, handleSubmit, formState: { errors }, reset, trigger, getValues } = useForm({
        defaultValues: {
            title: "",
            priority: "UNSORTED"
        }
    });

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [originalTitle, setOriginalTitle] = useState<string>('');
    const [originalPriority, setOriginalPriority] = useState<'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE'>('UNSORTED');

    useEffect(() => {
        if (itemId && itemTitle) {
            reset({
                title: itemTitle,
                priority: itemPriority || 'UNSORTED'
            });
            setOriginalTitle(itemTitle);
            setOriginalPriority(itemPriority || 'UNSORTED');
        } else if (isNew) {
            setOriginalTitle('');
            setOriginalPriority('UNSORTED');
        }
    }, [itemId, itemTitle, itemPriority, reset, isNew]);

    // Handle successful add operation
    useEffect(() => {
        if (onAddSuccess) {
            onAddSuccess(formData);
            if (isNew) {
                reset({ title: "", priority: "UNSORTED" });
                setOriginalTitle('');
                setOriginalPriority('UNSORTED');
            }
        }
    }, [onAddSuccess, formData, isNew, reset]);

    // Handle successful update operation
    useEffect(() => {
        if (onUpdateSuccess) {
            onUpdateSuccess(formData);
            const currentFormData = getValues();
            setOriginalTitle(currentFormData.title);
            setOriginalPriority(currentFormData.priority! as 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE');
        }
    }, [onUpdateSuccess, formData, getValues]);

    async function handleBlur(): Promise<void> {
        // Validate only relevant fields to avoid false negatives
        const fieldsToValidate = hidePriority ? ["title"] : ["title", "priority"];
        const isValid = await trigger(fieldsToValidate as any);

        if (!isValid) return;

        const formData = getValues();
        const titleChanged = formData.title !== originalTitle;
        const priorityChanged = !hidePriority && formData.priority !== originalPriority;

        if (titleChanged || priorityChanged) {
            onSubmit(formData);
        }
    }

    function handleDelete(): void {
        if (!itemId || isNew) {
            toast.error("Cannot delete new item");
            return;
        }
        onDelete?.();
    }

    return (
        <StyledForm
            onSubmit={handleSubmit(onSubmit)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <InlineFormContainer>
                <InputsContainer>
                    <InputContainer
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    >
                        <FormInput
                            type="text"
                            required
                            placeholder={isNew ? placeholder : undefined}
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
                            onBlur={handleBlur}
                        />
                    </InputContainer>

                    {!hidePriority && (
                        <PriorityContainer
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        >
                            <select
                                {...register("priority", {
                                    required: "Priority is required"
                                })}
                                onBlur={handleBlur}
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
                                <option value="UNSORTED">Unsorted</option>
                                <option value="MUST_HAVE">Must Have</option>
                                <option value="SHOULD_HAVE">Should Have</option>
                                <option value="COULD_HAVE">Could Have</option>
                            </select>
                        </PriorityContainer>
                    )}
                </InputsContainer>

                <ButtonContainer hasButtons={isHovered && itemId && !isNew || isFocused}>
                    {isHovered && itemId && !isNew && (
                        <InlineButton
                            type="button"
                            onClick={handleDelete}
                            isWorking={isDeleteWorking}
                        >
                            ✗
                        </InlineButton>
                    )}
                    {isFocused && (
                        <InlineButton
                            type="submit"
                            isWorking={isSubmitWorking}
                        >
                            ✓
                        </InlineButton>
                    )}
                </ButtonContainer>
            </InlineFormContainer>
            {(errors.title || (!hidePriority && errors.priority)) && (
                <div style={{ marginTop: 0 }}>
                    {errors.title && (
                        <p style={{ color: "red", fontSize: "0.875rem", margin: 0 }}>
                            {errors.title.message}
                        </p>
                    )}
                    {!hidePriority && errors.priority && (
                        <p style={{ color: "red", fontSize: "0.875rem", margin: 0 }}>
                            {errors.priority.message}
                        </p>
                    )}
                </div>
            )}
        </StyledForm>
    );
}

export default InlineFormInput;
