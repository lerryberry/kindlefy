import { useParams, useNavigate } from "react-router-dom";
import Button from '../util/Button';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import PageLayout from '../layouts/PageLayout';
import { useForm } from 'react-hook-form';
import { useAddCriteria } from './useAddCriteria';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";
import type { CreateCriteriaData } from '../../types/criteria';
import { useGetCriterion } from './useGetCriterion';
import { useEffect } from 'react';
import { useUpdateCriterion } from './useUpdateCriterion';

// Form data interface
interface CreateCriteriaFormData {
    title: string;
    description?: string;
    priority?: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
}

function CreateCriteriaForm() {
    const navigate = useNavigate();
    const { decisionId, criterionId } = useParams<{ decisionId: string; criterionId: string }>();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateCriteriaFormData>();

    const { addCriteria, isAdding, isSuccess, createdCriteria } = useAddCriteria();
    const { data: criterion, isLoading: isLoadingCriterion } = useGetCriterion(criterionId);
    const { updateCriterionMutation, isUpdating, isUpdateSuccess } = useUpdateCriterion();

    useEffect(() => {
        if (criterionId && criterion?.data) {
            reset({
                title: criterion.data.title,
                description: criterion.data.description || '',
                priority: criterion.data.priority
            });
        }
    }, [criterionId, criterion, reset]);

    useEffect(() => {
        if (isUpdateSuccess && decisionId && criterionId) {
            toast.success("Criterion updated successfully!");
            navigate(`/decisions/${decisionId}/criteria/${criterionId}`);
        }
    }, [isUpdateSuccess, decisionId, criterionId, navigate]);

    if (isSuccess && createdCriteria) {
        toast.success("Criteria added successfully!");
        navigate(`/decisions/${decisionId}`);
    }

    function onSubmit(data: CreateCriteriaFormData): void {
        if (!decisionId) {
            toast.error("Decision ID is required");
            return;
        }

        const criteriaData = {
            title: data.title,
            description: data.description || undefined,
            priority: data.priority,
        };

        if (criterionId) {
            updateCriterionMutation({ decisionId, criterionId, formData: criteriaData });
        } else {
            addCriteria({ ...criteriaData, parentDecision: decisionId } as CreateCriteriaData);
        }
    }

    function onError(errors: FieldErrors<CreateCriteriaFormData>): void {
        const errorMessage = Object.values(errors)[0]?.message || "Form validation failed";
        toast.error(errorMessage);
    }

    const isWorking = isAdding || isUpdating || isLoadingCriterion;
    const pageTitle = criterionId ? "Edit Criteria" : "New Criteria";
    const buttonText = criterionId
        ? (isUpdating ? "Updating criterion..." : "Update Criterion")
        : (isAdding ? "Adding criteria..." : "Create Criteria");

    return (
        <>
            {/* <BackButton /> // Removed BackButton usage */}
            <PageLayout
                title={pageTitle}
                showBackButton={true}
                onBackClick={() => navigate(`/decisions/${decisionId}`)}
            >
                <Form onSubmit={handleSubmit(onSubmit, onError)}>
                    <FormInput
                        label="Criteria title"
                        type="text"
                        required
                        {...register("title", {
                            required: "Title is required",
                            minLength: {
                                value: 3,
                                message: "Minimum of 3 characters required"
                            },
                            maxLength: {
                                value: 100,
                                message: "Maximum of 100 characters allowed"
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
                            maxLength: {
                                value: 500,
                                message: "Maximum of 500 characters allowed"
                            }
                        })}
                    />
                    {errors.description && (
                        <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                            {errors.description.message}
                        </p>
                    )}

                    <div>
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            {...register("priority", {
                                required: "Priority is required"
                            })}
                        >
                            <option value="">Select priority</option>
                            <option value="MUST_HAVE">Must Have</option>
                            <option value="SHOULD_HAVE">Should Have</option>
                            <option value="COULD_HAVE">Could Have</option>
                            <option value="WONT_HAVE">Won't Have</option>
                        </select>
                    </div>
                    {errors.priority && (
                        <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                            {errors.priority.message}
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

export default CreateCriteriaForm;
