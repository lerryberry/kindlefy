import Form from './../util/Form'
import FormInput from './../util/FormInput'
import RadioGroup from './../util/RadioGroup'
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddDecisions } from './useAddDecision';
import toast from 'react-hot-toast';
import type { CreateDecisionData } from '../../types/decision';
import type { CreateDecisionFormData, ValidationRules } from '../../types/common';
import { useGetDecision } from './useGetDecision';
import { useEffect, useState } from 'react';
import { useUpdateDecision } from './useUpdateDecision';
import PageLayout from '../layouts/PageLayout';
import DOMPurify from 'dompurify';
import validator from 'validator';

// Strict sanitization function - strips ALL HTML/code, only allows plain text
const sanitizeText = (input: string): string => {
    // First escape HTML entities
    const escaped = validator.escape(input);
    // Then strip ALL HTML tags (including safe ones)
    const stripped = DOMPurify.sanitize(escaped, { ALLOWED_TAGS: [] });
    // Trim whitespace
    return stripped.trim();
};


function CreateDecisionForm() {
    const navigate = useNavigate();
    const { decisionId } = useParams<{ decisionId: string }>();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateDecisionFormData>();
    const { addDecision, isAdding, isSuccess, createdDecision } = useAddDecisions();
    const { decision } = useGetDecision(decisionId);
    const { updateDecisionMutation, isUpdating, isUpdateSuccess } = useUpdateDecision();

    // State for category selection
    const [category, setCategory] = useState<string>('GENERIC');

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
        // Sanitize all text inputs - strip ALL HTML/code, only allow plain text
        const sanitizedTitle = sanitizeText(data.title);
        const sanitizedCategory = sanitizeText(category);

        const decisionData: CreateDecisionData = {
            title: sanitizedTitle,
            category: sanitizedCategory
        };
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
                            value: 5,
                            message: "Minimum of 5 characters required"
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

                <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        Decision Category
                    </label>
                    <RadioGroup
                        name="decisionCategory"
                        options={[
                            {
                                value: 'GENERIC',
                                label: 'Generic Decision',
                                description: 'General decision-making for any situation'
                            },
                            {
                                value: 'PRODUCT',
                                label: 'Product Decision',
                                description: 'Choose between different products or features'
                            },
                            {
                                value: 'SERVICE',
                                label: 'Service Decision',
                                description: 'Select service providers or service options'
                            },
                            {
                                value: 'STAFF',
                                label: 'Staff Decision',
                                description: 'Hiring, team selection, or personnel decisions'
                            }
                        ]}
                        value={category}
                        onChange={setCategory}
                    />
                </div>

            </Form>
        </PageLayout>
    )
}

export default CreateDecisionForm