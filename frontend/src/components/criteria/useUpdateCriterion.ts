import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportError } from "../../utils/errorReporting";

interface UpdateCriterionData {
    title?: string;
    description?: string;
    priority?: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
}

export function useUpdateCriterion() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const updateCriterion = async ({ decisionId, criterionId, formData }: { decisionId: string, criterionId: string, formData: UpdateCriterionData }) => {
        const res = await api.put(`/decisions/${decisionId}/criteria/${criterionId}`, formData);
        return res.data;
    };

    const { mutate: updateCriterionMutation, isPending: isUpdating, isSuccess: isUpdateSuccess, error } = useMutation({
        mutationFn: updateCriterion,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["criteria", variables.decisionId] });
            queryClient.invalidateQueries({ queryKey: ["criterion", variables.criterionId] });
            // Invalidate decision details so the stepper reflects latest status
            queryClient.invalidateQueries({ queryKey: ["decision", variables.decisionId] });
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        },
        onError: (err: any) => {
            reportError(err, { feature: 'criteria', action: 'update', entity: 'criterion' });
        }
    });

    return { updateCriterionMutation, isUpdating, isUpdateSuccess, error };
}
