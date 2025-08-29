import { useParams } from "react-router-dom";
import Button from '../util/Button';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import PageLayout from '../layouts/PageLayout';
import { useForm } from 'react-hook-form';
import { useAddOption } from './useAddOption';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";
import type { CreateOptionData } from '../../types/options';

interface CreateOptionFormData {
    title: string;
    description: string;
}

function CreateOptionForm() {

    const { decisionId } = useParams<{ decisionId: string }>();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateOptionFormData>();
    const { addOption, isAdding, isSuccess, createdOption } = useAddOption();

    // Show loading state and redirect on success
    // if (isAdding) {
    //     return <div>Adding option...</div>;
    // }

    if (isSuccess && createdOption) {
        toast.success("Option added successfully!");
        // Add a small delay to ensure the options list is refreshed before redirecting
        setTimeout(() => {
            window.history.back();
        }, 500);
    }

    function onSubmit(data: CreateOptionFormData): void {
        if (!decisionId) {
            toast.error("Decision ID is required");
            return;
        }

        const optionData: CreateOptionData = {
            title: data.title,
            description: data.description || undefined,
            parentDecision: decisionId
        };

        addOption(optionData);
    }

    function onError(errors: FieldErrors<CreateOptionFormData>): void {
        const errorMessage = Object.values(errors)[0]?.message || "Form validation failed";
        toast.error(errorMessage);
    }

    return (
        <>
            <PageLayout title="New Option">
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
                        type="text"
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
                        text={isAdding ? "Adding option..." : "Create Option"}
                        size="small"
                        disabled={isAdding}
                    />
                </Form>
            </PageLayout>
        </>
    );
}

export default CreateOptionForm;
