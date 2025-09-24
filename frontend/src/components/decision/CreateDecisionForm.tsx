import Form from './../util/Form'
import FormInput from './../util/FormInput'
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddDecisions } from './useAddDecision';
import toast from 'react-hot-toast';
import type { CreateDecisionData } from '../../types/decision';
import { useGetDecision } from './useGetDecision';
import { useEffect } from 'react';
import { useUpdateDecision } from './useUpdateDecision';
import PageLayout from '../layouts/PageLayout';

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
    const { decisionId } = useParams<{ decisionId: string }>();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateDecisionFormData>();
    const { addDecision, isAdding, isSuccess, createdDecision } = useAddDecisions();
    const { decision } = useGetDecision(decisionId);
    const { updateDecisionMutation, isUpdating, isUpdateSuccess } = useUpdateDecision();

    useEffect(() => {
        if (decisionId && decision) {
            reset({ title: decision.data.title });
        }
    }, [decisionId, decision, reset]);

    useEffect(() => {
        if (isUpdateSuccess && decisionId) {
            toast.success("Decision updated successfully!");
            navigate(-1);
        }
    }, [isUpdateSuccess, decisionId, navigate]);

    if (isSuccess && createdDecision) {
        toast.success("Decision added successfully!");
        navigate(`/decisions/${createdDecision.data._id}`);
        // return <div>Redirecting to your decision...</div>;
    }

    function onSubmit(data: CreateDecisionFormData): void {
        const decisionData: CreateDecisionData = { title: data.title };
        if (decisionId) {
            updateDecisionMutation({ id: decisionId, formData: decisionData });
        } else {
            addDecision(decisionData);
        }
    }

    function onError(): void {
        const errorMessage = errors.title?.message || "Form validation failed";
        toast.error(errorMessage);
    }

    const buttonText = decisionId
        ? (isUpdating ? "Updating decision..." : "Update Decision")
        : (isAdding ? "Adding decision..." : "Create Decision");

    const handleBackClick = () => {
        navigate('/decisions');
    };

    const handleNextClick = () => {
        // Trigger form submission
        handleSubmit(onSubmit, onError)();
    };

    return (
        <PageLayout
            title={decisionId ? "Edit Decision" : "New Decision"}
            showBackButton={true}
            onBackClick={handleBackClick}
            showNextButton={true}
            nextButtonText={buttonText}
            onNextClick={handleNextClick}
        >
            <Form onSubmit={handleSubmit(onSubmit, onError)}>
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
            </Form>
        </PageLayout>
    )
}

export default CreateDecisionForm