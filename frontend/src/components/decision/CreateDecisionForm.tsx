import Form from './../util/Form'
import FormInput from './../util/FormInput'
import SegmentedControl from './../util/SegmentedControl'
import RadioGroup from './../util/RadioGroup'
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddDecisions } from './useAddDecision';
import toast from 'react-hot-toast';
import type { CreateDecisionData } from '../../types/decision';
import { useGetDecision } from './useGetDecision';
import { useEffect, useState } from 'react';
import { useUpdateDecision } from './useUpdateDecision';
import PageLayout from '../layouts/PageLayout';
import DOMPurify from 'dompurify';
import validator from 'validator';

// Form data interface - only title is needed for creating decisions
interface CreateDecisionFormData {
    title: string;
    category: string;
    scope: string;
    type: string;
}

// Validation rules type
interface ValidationRules {
    required: string;
    minLength: {
        value: number;
        message: string;
    };
}

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

    // State for segmented controls
    const [category, setCategory] = useState<string>('Business');
    const [scope, setScope] = useState<string>('Individual');
    const [type, setType] = useState<string>('generic');

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
        const sanitizedScope = sanitizeText(scope);
        const sanitizedType = sanitizeText(type);

        const decisionData: CreateDecisionData = {
            title: sanitizedTitle,
            category: sanitizedCategory,
            scope: sanitizedScope,
            type: sanitizedType
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
                    <SegmentedControl
                        options={[
                            { value: 'Business', label: 'Business' },
                            { value: 'Personal', label: 'Personal', disabled: true }
                        ]}
                        value={category}
                        onChange={setCategory}
                    />
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <SegmentedControl
                        options={[
                            { value: 'Individual', label: 'Individual' },
                            { value: 'Group', label: 'Group', disabled: true }
                        ]}
                        value={scope}
                        onChange={setScope}
                    />
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <RadioGroup
                        name="decisionType"
                        options={[
                            {
                                value: 'generic',
                                label: 'Generic Decision',
                                description: 'General decision-making for any situation'
                            },
                            {
                                value: 'hiring',
                                label: 'Hiring Decision',
                                description: 'Choose the best candidate for your team',
                                disabled: true
                            },
                            {
                                value: 'services',
                                label: 'Service Selection',
                                description: 'Evaluate and select service providers',
                                disabled: true
                            },
                            {
                                value: 'products',
                                label: 'Product Choice',
                                description: 'Compare and choose between products',
                                disabled: true
                            }
                        ]}
                        value={type}
                        onChange={setType}
                    />
                </div>
            </Form>
        </PageLayout>
    )
}

export default CreateDecisionForm