import Button from './../util/Button'
import Form from './../util/Form'
import FormInput from './../util/FormInput'
import { useForm } from 'react-hook-form';
import { useAddDecisions } from './useAddDecision';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";
import type { FormData, CreateDecisionRequest } from '../../types';

function CreateDecisionForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const { addDecision, isAdding, isSuccess, error } = useAddDecisions();

    if (isAdding) toast.success("Adding decision now");
    if (isSuccess) toast.success("Decision added successfully");
    if (error) toast.error(`Error: ${error.message}`);

    function onSubmit(data: FormData) {
        addDecision({
            title: data.title,
            description: data.description
        });
    }

    function onError(errors: FieldErrors<FormData>) {
        const msg = errors.title?.message || "Failed to submit form";
        toast.error(msg);
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit, onError)} title="New Decision">
            <FormInput
                name="title"
                label="Decision title"
                placeholder="Enter decision title"
                required
                {...register("title", {
                    required: "This field is required",
                    minLength: {
                        value: 3,
                        message: "Minimum of 3 characters"
                    }
                })}
            />
            {errors.title && <p className="error">{errors.title.message}</p>}

            <FormInput
                name="description"
                label="Description"
                placeholder="Enter decision description (optional)"
                {...register("description")}
            />

            <Button type="submit" text="Create Decision" size="medium" disabled={isAdding} />
        </Form>
    );
}

export default CreateDecisionForm