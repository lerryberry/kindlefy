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
            // Invalidate criteria list to refresh the criteria list
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
            // Invalidate decision query to update status object
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            // Invalidate all decisions list to update status in decision tiles
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
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
