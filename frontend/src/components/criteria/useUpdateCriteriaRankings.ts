import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportError } from "../../utils/errorReporting";

interface CriteriaRanking {
    criterionId: string;
    priority: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
    globalRank: number;
}

interface UseUpdateCriteriaRankingsProps {
    decisionId: string;
}

export function useUpdateCriteriaRankings({ decisionId }: UseUpdateCriteriaRankingsProps) {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const updateCriteriaRankings = async (rankings: CriteriaRanking[]) => {
        const res = await api.put(`/decisions/${decisionId}/criteria/rankings`, rankings);
        return res.data;
    };

    const { mutate: updateCriteriaRankingsMutation, isPending: isUpdating, isSuccess, error } = useMutation({
        mutationFn: updateCriteriaRankings,
        onSuccess: () => {
            // Only invalidate criteria and decision queries - rankings don't affect other data
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
        },
        onError: (err: any) => {
            reportError(err, { feature: 'criteria', action: 'updateRankings', entity: 'criteria' });
        }
    });

    return {
        updateCriteriaRankingsMutation,
        isUpdating,
        isSuccess,
        error
    };
}
