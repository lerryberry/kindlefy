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
            // Invalidate criteria queries to refresh the lists
            queryClient.invalidateQueries({ queryKey: ["criteria"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { deleteCriterion: deleteCriterionMutation, isDeleting, isSuccess };
}
