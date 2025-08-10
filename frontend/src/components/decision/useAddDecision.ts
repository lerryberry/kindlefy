import { useCreateDecision } from "../../hooks/useApi";
import type { CreateDecisionRequest } from "../../types";

export function useAddDecisions() {
    const { mutate: addDecision, isPending: isAdding, isSuccess, error } = useCreateDecision();

    const handleAddDecision = (formData: CreateDecisionRequest) => {
        addDecision(formData);
    };

    return {
        isAdding,
        isSuccess,
        addDecision: handleAddDecision,
        error
    };
}