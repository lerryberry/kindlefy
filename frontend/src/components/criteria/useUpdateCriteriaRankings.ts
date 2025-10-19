import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedAxios } from '../../api/services/useAuthenticatedAxios';
import toast from 'react-hot-toast';

export interface CriteriaRanking {
    criterionId: string;
    priority: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
    ranking: number;
}

export function useUpdateCriteriaRankings({ decisionId }: { decisionId: string }) {
    const queryClient = useQueryClient();
    const api = useAuthenticatedAxios();

    const updateCriteriaRankings = async (rankings: CriteriaRanking[]) => {
        const res = await api.put(`/decisions/${decisionId}/criteria/rankings`, rankings);
        return res.data;
    };

    const { mutate: updateCriteriaRankingsMutation, isPending: isUpdating, isSuccess, error } = useMutation({
        mutationFn: updateCriteriaRankings,
        onSuccess: () => {
            // Invalidate and refetch criteria queries
            queryClient.invalidateQueries({ queryKey: ['criteria', decisionId] });
            queryClient.invalidateQueries({ queryKey: ['decision', decisionId] });
            toast.success("Criteria rankings updated successfully");
        },
        onError: (error: any) => {
            console.error('Error updating criteria rankings:', error);
            toast.error("Failed to update criteria rankings");
        }
    });

    return {
        updateCriteriaRankingsMutation,
        isUpdating,
        isSuccess,
        error
    };
}
