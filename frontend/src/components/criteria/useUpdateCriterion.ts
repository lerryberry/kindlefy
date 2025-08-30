import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateCriterionData {
    title?: string;
    description?: string;
    priority?: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
}

export function useUpdateCriterion() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const updateCriterion = async ({ decisionId, criterionId, formData }: { decisionId: string, criterionId: string, formData: UpdateCriterionData }) => {
        const res = await api.put(`/decisions/${decisionId}/criteria/${criterionId}`, formData);
        return res.data;
    };

    const { mutate: updateCriterionMutation, isPending: isUpdating, isSuccess: isUpdateSuccess } = useMutation({
        mutationFn: updateCriterion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allCriteria"] });
            queryClient.invalidateQueries({ queryKey: ["criterion"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { updateCriterionMutation, isUpdating, isUpdateSuccess };
}
