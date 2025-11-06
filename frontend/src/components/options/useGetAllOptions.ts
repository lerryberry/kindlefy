import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { UseGetOptionListReturn } from '../../types/options';

export function useGetAllOptions(decisionId: string): UseGetOptionListReturn {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["allOptions", decisionId],
        queryFn: async () => {

            const res = await api.get(`/decisions/${decisionId}/options`);
            return res.data;
        },
        enabled: !!decisionId
    });

    // Invalidate decision query when options are fetched to update stepper
    useEffect(() => {
        if (isSuccess && data) {
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        }
    }, [isSuccess, data, decisionId, queryClient]);

    return { data, isLoading, error, isSuccess, isError, isFetching };
}
