import Button from './../util/Button'
import Form from './../util/Form'
import FormInput from './../util/FormInput'
import { useForm } from 'react-hook-form';
import { useAddDecisions } from './useAddDecision';
import toast from 'react-hot-toast';
import type { FieldErrors } from "react-hook-form";

type FormData = {
    title: string;
    data: string;
};

function CreateDecisionForm() {

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const { addDecision, isAdding, isSuccess } = useAddDecisions();

    if (isAdding) toast.success("addin decision now")
    if (isSuccess) toast.success("decision added successfully")

    function onSubmit(data: FormData) {
        addDecision({ title: data.title });
    }

    function onError(errors: FieldErrors<FormData>) {
        const msg = errors.title?.message || "failed";
        toast.error(msg)
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit, onError)} title="new decision">
            <FormInput
                label="Decision title"
                {...register("title", {
                    required: "this field is required",
                    minLength: {
                        value: 9,
                        message: "minimum of 9 characters"
                    }
                })}
            />
            {errors.title && <p style={{ color: "red" }}>{errors.title.message}</p>}
            <Button type="submit" text="submit" size="small" />
        </Form>
    )
}

export default CreateDecisionForm