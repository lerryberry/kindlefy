import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export function useDeleteCriterion() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();
    const { decisionId } = useParams();

    const deleteCriterion = async (criterionId: string) => {
        const res = await api.delete(`/decisions/${decisionId}/criteria/${criterionId}`);
        return res.data;
    };

    const { mutate: deleteCriterionMutation, isPending: isDeleting, isSuccess } = useMutation({
        mutationFn: deleteCriterion,
        onSuccess: () => {
            // Invalidate criteria list to refresh the criteria list
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
            // Invalidate decision query to update status object
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            // Invalidate all decisions list to update status in decision tiles
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { deleteCriterion: deleteCriterionMutation, isDeleting, isSuccess };
}
