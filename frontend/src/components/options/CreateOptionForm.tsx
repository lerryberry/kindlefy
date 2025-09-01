import { useParams, useNavigate } from "react-router-dom";
import Button from '../util/Button';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import PageLayout from '../layouts/PageLayout';
import { useForm } from 'react-hook-form';
import { useAddOption } from './useAddOption';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";
import type { CreateOptionData } from '../../types/options';
import { useEffect } from 'react';
import { useGetOption } from './useGetOption';
import { useUpdateOption } from './useUpdateOption';

interface CreateOptionFormData {
    title: string;
    description: string;
}

function CreateOptionForm() {

    const { decisionId, optionId, criterionId } = useParams<{ decisionId: string; optionId: string; criterionId: string }>();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateOptionFormData>();
    const { addOption, isAdding, isSuccess: isAddSuccess, createdOption } = useAddOption();
    const { data: optionData, isLoading: isLoadingOption } = useGetOption(optionId!); // Fetch option data if in edit mode
    const { updateOptionMutation, isUpdating, isSuccess: isUpdateSuccess, updatedOption } = useUpdateOption();

    useEffect(() => {
        if (optionId && optionData?.data) {
            reset({
                title: optionData.data.title,
                description: optionData.data.description || "",
            });
        }
    }, [optionId, optionData, reset]);

    const isWorking = isAdding || isUpdating || isLoadingOption;

    if (isAddSuccess && createdOption) {
        setTimeout(() => {
            // Navigate back to the decision's options list
            navigate(`/decisions/${decisionId}/criteria/${criterionId}`);
        }, 500);
    }

    if (isUpdateSuccess && updatedOption) {
        setTimeout(() => {
            // Navigate back to the prior page
            navigate(-1);
        }, 500);
    }

    function onSubmit(data: CreateOptionFormData): void {
        if (!decisionId) {
            toast.error("Decision ID is required");
            return;
        }

        if (optionId) {
            // Edit mode
            updateOptionMutation({
                optionId: optionId,
                decisionId: decisionId,
                title: data.title,
                description: data.description || undefined,
            });
        } else {
            // Create mode
            const optionData: CreateOptionData = {
                title: data.title,
                description: data.description || undefined,
                parentDecision: decisionId
            };
            addOption(optionData);
        }
    }

    function onError(errors: FieldErrors<CreateOptionFormData>): void {
        const errorMessage = Object.values(errors)[0]?.message || "Form validation failed";
        toast.error(errorMessage);
    }

    const pageTitle = optionId ? "Edit Option" : "New Option";
    const buttonText = optionId
        ? (isUpdating ? "Updating option..." : "Update Option")
        : (isAdding ? "Adding option..." : "Create Option");

    return (
        <>
            <PageLayout
                title={pageTitle}
                showBackButton={true}
                onBackClick={() => navigate(`/decisions/${decisionId}/criteria/${criterionId}`)}
            >
                <Form onSubmit={handleSubmit(onSubmit, onError)}>
                    <FormInput
                        label="Option title"
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

                    <FormInput
                        label="Description (optional)"
                        componentType="textarea"
                        rows={5}
                        {...register("description", {
                            minLength: {
                                value: 10,
                                message: "Minimum of 10 characters required"
                            },
                            maxLength: {
                                value: 1000,
                                message: "Maximum of 1000 characters allowed"
                            }
                        })}
                    />
                    {errors.description && (
                        <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                            {errors.description.message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        text={buttonText}
                        size="small"
                        disabled={isWorking}
                        isResponsive
                    />
                </Form>
            </PageLayout>
        </>
    );
}

export default CreateOptionForm;
