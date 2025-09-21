import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RankingFormData } from '../../types/options';

interface UseUpdateRankingsProps {
    decisionId: string;
    criterionId: string;
}

export function useUpdateRankings({
    decisionId,
    criterionId,
}: UseUpdateRankingsProps) {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rankings: RankingFormData[]) => {
            const res = await api.post(`/decisions/${decisionId}/criteria/${criterionId}/ranking`, rankings);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rankedOptions", criterionId] });
            queryClient.invalidateQueries({ queryKey: ["criterion", criterionId] });
            // Invalidate general criteria list to update isRanked status
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
            // Invalidate decision query to update status object
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            // Invalidate all decisions list to update status in decision tiles
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        },
    });
}
