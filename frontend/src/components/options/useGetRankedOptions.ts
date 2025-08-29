import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import type { UseGetRankedOptionListReturn } from '../../types/options';

export function useGetRankedOptions(criterionId: string): UseGetRankedOptionListReturn {
    const api = useAuthenticatedAxios();
    const { decisionId } = useParams();

    const { data, isLoading, error, isSuccess, isError, isFetching, refetch } = useQuery({
        queryKey: ["rankedOptions", criterionId],
        queryFn: async () => {
            const res = await api.get(`/decisions/${decisionId}/criteria/${criterionId}/ranking`);
            return res.data;
        },
        enabled: !!criterionId && !!decisionId
    });

    return { data, isLoading, error, isSuccess, isError, isFetching, refetch };
}
