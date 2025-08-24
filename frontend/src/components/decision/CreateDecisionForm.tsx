import Button from './../util/Button'
import Form from './../util/Form'
import FormInput from './../util/FormInput'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAddDecisions } from './useAddDecision';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";
import type { CreateDecisionData } from '../../types/decision';

// Form data interface - only title is needed for creating decisions
interface CreateDecisionFormData {
    title: string;
}

// Validation rules type
interface ValidationRules {
    required: string;
    minLength: {
        value: number;
        message: string;
    };
}

function CreateDecisionForm() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<CreateDecisionFormData>();
    const { addDecision, isAdding, isSuccess, createdDecision } = useAddDecisions();

    // Show loading state and redirect on success
    if (isAdding) {
        return <div>Adding decision...</div>;
    }

    if (isSuccess && createdDecision) {
        toast.success("Decision added successfully!");
        navigate(`/decisions/${createdDecision.data._id}`);
        return <div>Redirecting to your decision...</div>;
    }

    function onSubmit(data: CreateDecisionFormData): void {
        const decisionData: CreateDecisionData = { title: data.title };
        addDecision(decisionData);
    }

    function onError(errors: FieldErrors<CreateDecisionFormData>): void {
        const errorMessage = errors.title?.message || "Form validation failed";
        toast.error(errorMessage);
    }

    return (
        <>
            <Form onSubmit={handleSubmit(onSubmit, onError)} title="new decision">
                <FormInput
                    label="Decision title"
                    type="text"
                    required
                    {...register("title", {
                        required: "This field is required",
                        minLength: {
                            value: 9,
                            message: "Minimum of 9 characters required"
                        },
                        maxLength: {
                            value: 200,
                            message: "Maximum of 200 characters allowed"
                        }
                    } as ValidationRules)}
                />
                {errors.title && (
                    <p style={{ color: "red", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {errors.title.message}
                    </p>
                )}
                <Button
                    type="submit"
                    text={isAdding ? "Adding..." : "Create Decision"}
                    size="small"
                    disabled={isAdding}
                />
            </Form>
        </>
    )
}

export default CreateDecisionForm